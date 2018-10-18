<template>
  <div style="font-size: .32rem; width: 100%; height: 100%;">
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="3.5em" v-show="custType == 3">
      <div class="contact">
        <div class="contact-radio">
          <div class="d-flex" @click="checkRadio(0)"><span :class="[selectType == 0 ? 'radio-on':'radio-off']" class="span-radio" style="margin-left: 2em;">投诉</span></div>
          <div class="d-flex" @click="checkRadio(1)"><span :class="[selectType == 0 ? 'radio-off':'radio-on']" class="span-radio">建议</span></div>
        </div>
        <div class="contact-li">
          <input placeholder="车辆VIN码，以“;”分割" v-model="contact.vin"/>
        </div>
        <div class="contact-li">
          <input placeholder="请输入标题" v-model="contact.title"/>
        </div>
        <div class="contact-li">
          <input placeholder="请输入联系电话" v-model="contact.phone"/>
        </div>
        <div class="contact-li">
          <input placeholder="请输入联系邮箱" v-model="contact.email"/>
        </div>
        <div class="contact-textarea">
          <textarea placeholder="请输入描述" v-model="contact.textarea"></textarea>
        </div>
        <div class="damage-img-box">
          <div class="damage-img" v-for="(item,index) in contact.pictureArr" @click="previewImg(index)">
            <img :src="item"/>
            <div class="damage-close" v-show="item!=''" @click.stop="imgDel(index)"></div>
          </div>
          <div class="damage-null" @click="imgUp()" v-show="contact.pictureArr.length<3"></div>
        </div>
      </div>
      <div slot="bottom" class="contact-bottom">
        <div class="contact-btn" @click="subminContact">确认</div>
      </div>
    <!--<tabbar class="crm-tabbar">-->
      <!--<div class="crm-tabbtn" @click="subminContact"><span>确认</span></div>-->
    <!--</tabbar>-->
    </view-box>
    <div v-if="custType == 1" class="no-data">非经销商无权查看此页面</div>
  </div>
</template>

<script>
  let rootUrl = sessionStorage.getItem('rooturl');
  import {ViewBox,Tabbar, TabbarItem} from 'vux'
  import Vue from 'vue'
  import {WechatPlugin} from 'vux'
  Vue.use(WechatPlugin)//使用微信插件
  export default {
    name: 'contact',
    components: {
      ViewBox,
      Tabbar,
      TabbarItem
    },
    mounted() {
      let hrefUrl = window.location.href;
      let self = this;
      this.$api.post("crm/wechart/getSign", {url: hrefUrl}, r => {
        self.imgToken = r.repData.token;
        Vue.wechat.config({
          // debug: true,
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
    data() {
      return {
        // action sheet 选项内容
        // data: [],
        // action sheet 默认不显示，为false。操作sheetVisible可以控制显示与隐藏
        imgToken:'',
        selectType: 0,
        dealerCode: '',
        custType: 0, //是否是经销商
        contact: {
          vin: '',
          title: '',
          phone: '',
          email: '',
          textarea: '',
          pictureArr:[],
          httpPicture:[]
        }
      }
    },
    methods: {
      //图片选择
      imgUp() {
        let self = this;
        Vue.wechat.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          success: function (res) {
            for(let i in res.localIds){
              self.contact.pictureArr.push(res.localIds[i])
            }
            for(var i=0;i<self.contact.pictureArr.length;i++){
              self.uploadImg(self.contact.pictureArr[i]);
            }
          }
        });
      },
      // 图片上传微信服务器
      uploadImg(local) {
        let self = this;
        Vue.wechat.uploadImage({
          localId: local,
          success: function (res) {
            self.toUpLoad(res.serverId)
          },
        });
      },// 上传图片服务器，回显http地址
      toUpLoad(serverId) {
        let self = this;
        let p = {
          // operateCode: '147',
          // operateName: '/质损中心/图片上传',
          operateCode: '',
          operateName: '',
          mediaId: serverId,
          accessToken: self.imgToken
        }
        self.$api.post("file/nfsController/wechatUpload", p, r => {
          // alert("成功"+JSON.stringify(r));
        }, e => {
          for(var i=0;i<e.length;i++){
            self.contact.httpPicture.push(e[i])
          }
          // alert(JSON.stringify(e))
          // alert(self.contact.httpPicture)
        })
      },
      // 图片预览
      previewImg(index) {
        let self = this;
        let imgUrl = self.contact.httpPicture[index];
        // alert("当前url"+imgUrl)
        // alert("列表"+self.contact.httpPicture)
        Vue.wechat.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: self.contact.httpPicture // 需要预览的图片http链接列表
        });
      },
      //删除上传图片
      imgDel(index) {
        let self = this;
        self.$vux.confirm.show({
          content: '删除照片',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel() {
          },
          onConfirm() {
            self.contact.pictureArr.splice(index,1)
            self.contact.httpPicture.splice(index,1)
          }
        })
      },
      checkRadio(n){
        this.selectType = n;
      },
      subminContact() {
        let self = this;
        if(self.contact.vin == ''){
          self.$vux.toast.show({
            text: '请输入VIN码!',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        if(self.contact.title == ''){
          self.$vux.toast.show({
            text: '请输入标题!',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        let p = {
          operateCode: '102',
          operateName: '/投诉中心',
          contents: self.contact.textarea,
          phone: self.contact.phone,
          email: self.contact.email,
          ishandle: 0,
          title: self.contact.title,
          type: self.selectType,
          vin: self.contact.vin,
          dealerCode: self.dealerCode,
          // imgUrl:[...(self.contact.httpPicture)]
          imgUrl:self.contact.httpPicture.toString()
        }
        self.$api.post('crm/comment/insertOrUpdate', p, r => {
          this.$router.push(rootUrl + "/contactList");
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
          return
        })
      }
    },
    created() {
      let self = this;
      var id = self.$api.ssGet('token');
      id = id.substring(0,id.indexOf('_'))
      self.$api.post('crm/customer/getByPrimaryKey', {
        id: id
      }, r => {
        self.dealerCode = r.repData.dealerCode;
        if(r.repData.custType == 3){
          self.custType = 3;
        }else{
          self.custType = 1;
        }
      }, e => {
        console.log(e);
      })
    }
  }
</script>
<style scoped>
  .no-data{
    font-size: .8em;
    color: #aaa;
    line-height: 2em;
    position: absolute;
    top: 50%;
    margin-top: -1em;
    width: 100%;
    text-align: center;
  }
  .crm-tabbtn span {
    font-size: .9em;
  }

  .contact {
    padding: .5em .8em 1em;
    /*height: 100%;*/
  }

  .contact-radio {
    padding: 0 2em;
    height: 3em;
    line-height: 3em;
    border-bottom: 1px solid #e2e2e2;
    position: relative;
    overflow: hidden;
    display: -moz-box; /* OLD - Firefox 19- (buggy but mostly works) */
    display: -webkit-box; /* OLD - iOS 6-, Safari 3.1-6 */
    display: -webkit-flex; /* NEW - Chrome */
    display: -ms-flexbox; /* TWEENER - IE 10 */
    display: box;
    display: flexbox;
    display: flex; /* NEW, Spec - Opera 12.1, Firefox 20+ */
  }

  .d-flex {
    -webkit-box-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    position: relative;
  }

  .span-radio {
    padding-left: 1.8em;
    color: #666;
    font-size: .9em;
  }
  .radio-off{
    background: url("../../assets/img/icon_off.png") no-repeat 0 center;
    background-size: 1.5em;
  }
  .radio-on {
    background: url("../../assets/img/icon_on.png") no-repeat 0 center;
    background-size: 1.5em;
  }

  .contact-li {
    padding: 0 .5em;
    height: 3em;
    line-height: 3em;
    border-bottom: 1px solid #e2e2e2;
    position: relative;
    overflow: hidden;
  }

  .contact-li > p {
    font-size: .9em;
    color: #999;
  }

  .contact-li > span {
    width: 0;
    height: 0;
    border-width: .3em .4em 0;
    border-style: solid;
    border-color: #999 transparent transparent;
    position: absolute;
    top: 1.2em;
    right: .8em;
  }

  .contact-li > input {
    width: 100%;
    height: 100%;
    font-size: .9em;
    color: #999;
  }

  .contact-textarea {
    height: 6.4em;
    border: 1px solid #e2e2e2;
    margin-top: .5em;
    padding: .4em .5em;
  }

  .contact-textarea > textarea {
    width: 100%;
    height: 100%;
    font-size: .9em;
    line-height: 1.2em;
    color: #999;
    padding: 0;
    border: none;
    resize: none;
  }

  .contact-li > input:-ms-input-placeholder {
    color: #999;
    opacity: 1;
  }

  .contact-textarea > textarea:-ms-input-placeholder {
    color: #999;
    opacity: 1;
  }

  .contact-li > input::-webkit-input-placeholder {
    color: #999;
    opacity: 1;
  }

  .contact-textarea > textarea::-webkit-input-placeholder {
    color: #999;
    opacity: 1;
  }

  .contact-bottom{
    padding: .5em;
    height: 2.5em;
    line-height: 2.5em;
    position: relative;
    margin-top: -3.5em;
    background: #f9f9f9;
    box-shadow: 0 -1px 5px #e2e2e2;
  }
  .contact-btn{
    width: 8em;
    height: 100%;
    line-height: inherit;
    margin: 0 auto;
    font-size: .9em;
    text-align: center;
    color: #fff;
    background: #ca151e;
    color: #fff;
    border-radius: 1.5em;
  }
  .damage-img-box {
    width: 100%;
    margin-top: .5em;
    /*width: 6em;*/
    /*height: 6em;*/
    /*margin-top: .5em;*/
    /*border: 1px solid #c1c1c1;*/
    /*position: relative;*/
  }
  .damage-null {
    width: 6em;
    height: 6em;
    border: 1px solid #c1c1c1;
    background: url("../../assets/img/icon_damage_add.png") center no-repeat;
    background-size: 2em;
    display: inline-block;
  }
  .damage-img {
    width: 6em;
    height: 6em;
    margin-right: .5em;
    display: inline-block;
    position: relative;
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
    /*z-index: 999;*/
  }
</style>
