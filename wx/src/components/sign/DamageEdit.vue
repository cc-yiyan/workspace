<template>
  <div style="height: 100%;font-size: .32rem;">
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="3.5em">
      <div class="contact">
        <div v-for="(item,index) in damage.detail">
          <div class="info-li" style="border-bottom: none;">
            <p>质损部位 {{index + 1}}</p>
            <div class="damage-del" @click="liDamageDel(index)" v-if="damage.detail.length > 1"></div>
          </div>
          <div @click="changeBox(index)">
            <group>
              <popup-picker :title="damage.popTitle" :data="list" :columns="2" v-model="item.popValue"
                            @on-change="onChange" show-name></popup-picker>
            </group>
          </div>
          <div class="damage-text">
            <textarea placeholder="详细描述" v-model="item.damageText"></textarea>
          </div>
          <div class="damage-img-box">
            <div class="damage-null" @click="imgUp(index)" v-if="item.imgSrc == ''"></div>
            <div class="damage-img" v-if="item.imgSrc != ''" @click="previewImg(index)"><img
              :src="item.imgSrc != '' ? item.imgSrc : item.wxSrc"/></div>
            <div class="damage-close" v-if="item.imgSrc != ''" @click="imgDel(item)"></div>
          </div>
        </div>
        <div class="add-btn" v-if="addState" @click="addDamage">
          添加质损信息
        </div>
      </div>
      <div class="btn-wrap">
        <span class="all-btn" @click="submit">确认质损</span>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {ViewBox, PopupPicker, Group} from 'vux'
  import Vue from 'vue'
  import {WechatPlugin} from 'vux'

  Vue.use(WechatPlugin)//使用微信插件
  let rootUrl = sessionStorage.getItem('rooturl');
  export default {
    name: "DamageCommit",
    components: {
      ViewBox,
      PopupPicker,
      Group
    },
    data() {
      return {
        imgToken: '',
        damage: {
          popTitle: '选择部位',
          detail: [],
        },
        list: [],
        popIndex: '',
        addState: false,
        // imgId: ''
      }
    },
    beforeRouteEnter(to, from, next) {
      let hrefUrl = window.location.href;
      let url = hrefUrl.split(rootUrl)[0];
      if (from.path == rootUrl + '/damageList') {
        location.assign(url + to.path)
      } else {
        next()
      }
    },
    mounted() {
      let hrefUrl = window.location.href;
      let self = this;
      this.$api.post("crm/wechart/getSign", {url: hrefUrl}, r => {
        self.imgToken = r.repData.token;
        Vue.wechat.config({
          //debug: true,
          appId: r.repData.appId.toString(), // 必填，公众号的唯一标识
          timestamp: r.repData.timeStamp.toString(), // 必填，生成签名的时间戳
          nonceStr: r.repData.nonceStr.toString(), // 必填，生成签名的随机串
          signature: r.repData.sign.toString(),  //必填，签名
          jsApiList: ["chooseImage", "uploadImage", "previewImage"]
        });
      }, e => {
      })
      Vue.wechat.ready(function () {
      })
    },
    methods: {
      loadData() {
        var self = this;
        this.$api.post("crm/sign/displayLoseName", {}, r => {
          let len = r.repData.length;
          for (var i = 0; i < len; i++) {
            if (r.repData[i].children != '') {
              let obj = {
                name: r.repData[i].label,
                value: r.repData[i].value.toString(),
                parent: 0
              }
              self.list.push(obj);
              for (var j = 0; j < r.repData[i].children.length; j++) {
                let objChild = {
                  name: r.repData[i].children[j].label,
                  value: r.repData[i].children[j].value.toString(),
                  parent: r.repData[i].value.toString()
                }
                self.list.push(objChild);
              }
            }
          }
        }, e => {
          if(e.repCode == '0104'){
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else{
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
        let _editDetail = self.$api.ssGet('editDetail');
        this.$api.post("crm/sign/echoVehicleLose", {receiveId: _editDetail.receiveId}, r => {
          for (var i = 0; i < r.repData.length; i++) {
            let arr = [];
            arr.push(r.repData[i].loseId[0].toString());
            arr.push(r.repData[i].loseId[1].toString());
            let obj = {
              popValue: arr,
              damageText: r.repData[i].reason,
              wxSrc: '',
              imgSrc: (r.repData[i].imgUrl.length < 1) ? '' : r.repData[i].imgUrl[0].url,
            }
            self.damage.detail.push(obj);
          }
          // console.log(self.damage.detail);
        }, e => {
          if(e.repCode == '0104'){
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else{
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
      },
      // 选择质损部位
      changeBox(index) {
        this.popIndex = index;
      },
      onChange(val) {
        this.addState = true;
        if (this.damage.detail[this.popIndex] != undefined) {
          this.damage.detail[this.popIndex].popValue = val;
        }
      },
      //添加质损信息
      addDamage() {
        this.addState = false;
        this.damage.detail.push({
            popValue: [,],
            damageText: '',
            wxSrc: '',
            imgSrc: '',
          }
        );
      },
      liDamageDel(index) {
        let self = this;
        // console.log(index);
        self.$vux.confirm.show({
          content: '删除质损信息',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel() {
          },
          onConfirm() {
            self.damage.detail.splice(index, 1);
          }
        })
      },
      //图片选择
      imgUp(n) {
        let self = this;
        Vue.wechat.chooseImage({
          //debug: true,
          count: 1,
          sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        //   sourceType: ['album', 'camera'],
          success: function (res) {
            self.damage.detail[n].wxSrc = res.localIds[0];
            self.uploadImg(n);
          }
        });
      },
      // 图片上传微信服务器
      uploadImg(n) {
        let self = this;
        Vue.wechat.uploadImage({
          localId: this.damage.detail[n].wxSrc,
          success: function (res) {
            self.toUpLoad(res.serverId, n)
            // window.prompt('', JSON.stringify(res));
          },
        });
      },
      // 上传图片服务器，回显http地址
      toUpLoad(serverId, n) {
        let self = this;
        let p = {
          operateCode: '144',
          operateName: '/质损中心/上传图片',
          mediaId: serverId,
          accessToken: this.imgToken
        }
        this.$api.post("file/nfsController/wechatUpload", p, r => {
          // alert(JSON.stringify(r));
        }, e => {
          self.damage.detail[n].imgSrc = e;
        })
      },
      // 图片预览
      previewImg(index) {
        let self = this;
        if (self.damage.detail[index].wxSrc == '') {
          let imgUrl = self.damage.detail[index].imgSrc;
          let imgs = [];
          imgs.push(self.damage.detail[index].imgSrc);
          Vue.wechat.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: imgs // 需要预览的图片http链接列表
          });
        }
        else {
          let imgUrl = self.damage.detail[index].imgSrc[0];
          let imgs = [];
          for (var i in self.damage.detail[index].imgSrc) {
            imgs.push(self.damage.detail[index].imgSrc[i]);
          }
          Vue.wechat.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: imgs // 需要预览的图片http链接列表
          });
        }
      },
      //删除上传图片
      imgDel(item) {
        let self = this;
        self.$vux.confirm.show({
          content: '删除照片',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel() {
          },
          onConfirm() {
            item.wxSrc = '';
            item.imgSrc = '';
          }
        })
      },
      submit() {
        let self = this;
        for (var i = 0; i < self.damage.detail.length; i++) {
          if(self.damage.detail[i].popValue.length < 2 || self.damage.detail[i].damageText==""){
            self.$vux.toast.show({
              text: '请完善信息',
              time: '2000',
              type: 'text',
              position: 'middle'
            })
            return;
          }
        }
        let _editDetail = self.$api.ssGet('editDetail');
        self.$vux.confirm.show({
          content: '确认质损信息',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel() {
          },
          onConfirm() {
            let len = self.damage.detail.length;
            let arr = [];
            for (var i = 0; i < len; i++) {
              let obj = {
                id: null,
                reason: self.damage.detail[i].damageText,
                receiveId: _editDetail.receiveId,
                parentId: self.damage.detail[i].popValue[0],
                losePositionId: self.damage.detail[i].popValue[1]
              }
              if (self.damage.detail[i].imgSrc == '') {
                obj.loseImgUrl = ''
              }
              else {
                if(typeof self.damage.detail[i].imgSrc == 'string'){
                  obj.loseImgUrl = self.damage.detail[i].imgSrc;
                }
                else{
                  obj.loseImgUrl = self.damage.detail[i].imgSrc.join(',')
                }
              }
              arr.push(obj);
            }
            self.$api.post("crm/sign/updateVehicleLose", {operateCode: '145', operateName: '/质损中心/编辑质损',vehicleRegister: arr}, r => {
              sessionStorage.removeItem('editDetail');
              self.$router.push({
                path: rootUrl + "/damageList"
              });
              // self.damage.detail[n].imgSrc = r;
            }, e => {
            })
          }
        })
      }
    },
    created() {
      this.loadData();
    }
  }
</script>


<style scoped>
  .contact {
    padding: 1em .8em;
    height: auto;
  }

  /*footer*/
  .btn-wrap {
    position: fixed;
    z-index: 98;
    width: 100%;
    bottom: 0;
    height: 2.5em;
    line-height: 2.5em;
    padding-top: .5em;
    padding-bottom: .5em;
    background: #ffffff;
    border-top: 1px solid #f2f1f1;
    box-shadow: 0 0px 2px #e2e2e2;
  }

  .all-btn {
    display: block;
    width: 7.5em;
    height: 100%;
    font-size: .9em;
    line-height: inherit;
    background: #ca151e;
    margin: 0 auto;
    color: #fff;
    text-align: center;
    border-radius: 2em;
  }

  .info-li {
    padding: 0 .5em;
    height: 3.5em;
    line-height: 3.5em;
    position: relative;
    border-bottom: 1px solid #e2e2e2;
    color: #999;
  }

  .info-li > p {
    font-size: .9em;
  }

  .info-li > span, .info-li > a {
    font-size: .9em;
    color: #f3d19e;
    position: absolute;
    top: 0;
    right: .5em;
    display: block;
  }

  .info-li > i {
  }

  .damage-img-box {
    width: 6em;
    height: 6em;
    margin-top: .5em;
    border: 1px solid #c1c1c1;
    position: relative;
  }

  .damage-null {
    width: 100%;
    height: 100%;
    background: url("../../assets/img/icon_damage_add.png") center no-repeat;
    background-size: 2em;
  }

  .damage-img {
    width: 100%;
    height: 100%;
  }

  .damage-img img {
    width: 100%;
    height: 100%;
  }

  .damage-close {
    width: 1.5em;
    height: 1.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: url("../../assets/img/icon_damage_del.png") no-repeat center;
    background-size: 1em;

  }

  .damage-text {
    margin-top: .5em;
    border: 1px solid #c1c1c1;
    height: 4.5em;
    padding: 2px 3px;
  }

  .damage-text textarea {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    line-height: 1.5em;
    color: #666;
    resize: none;
    font-size: .8em;
  }

  .vux-cell-box {
    width: 100%;
    height: 3em;
    color: #666;
    border-bottom: 1px solid #e2e2e2;
    font-size: .8em;
    margin-top: 0;
  }

  .add-btn {
    width: 8em;
    height: 3em;
    line-height: 3em;
    margin: 1em auto 0;
    font-size: .8em;
    color: #666;
    text-align: center;
    border: 1px solid #ffaa00;
  }

  .damage-del {
    width: 3em;
    height: 3em;
    background: url("../../assets/img/icon_damage_li.png") no-repeat center 1.5em;
    background-size: 1em .2em;
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
