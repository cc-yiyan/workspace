<template>
  <div style="height: 100%;font-size: .32rem;">
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="0">
      <div class="contact">
        <ul style="">
          <li v-for="(items, index) in list" :key="index"  class="list-item">
            <div class="title" :class="{bb:items.reason||items.imgUrl}">
              <span style="margin-left: .5em;">质损部位</span>
              <span style="position: absolute;right: .8em;">{{changeText(items.loseId)}}</span>
            </div>
            <div class="text" v-if="items.reason">{{items.reason}}</div>
            <div v-if="items.imgUrl" class="damage-img">
              <img v-for="item in items.imgUrl" @click="previewImg(item)"
                   :src='item.url'/>
            </div>
          </li>
        </ul>
      </div>
    </view-box>
    <div v-show="noDataShow" class="no-data">暂无数据</div>
  </div>
</template>

<script>
  import {ViewBox, Previewer, Confirm, TransferDom } from 'vux';
  let rootUrl = sessionStorage.getItem('rooturl');
  import Vue from 'vue'
  import {WechatPlugin} from 'vux'

  Vue.use(WechatPlugin)//使用微信插件
  export default {
    name: "SignDetail",
    directives: {
      TransferDom
    },
    components: {
      ViewBox,
      Previewer,
      Confirm
    },
    beforeRouteEnter(to, from, next) {
      let hrefUrl = window.location.href;
      let url = hrefUrl.split(rootUrl)[0];
      if (from.path == rootUrl + '/signDetail') {
        location.assign(url + to.path)
      } else {
        next()
      }
    },
    data() {
      return {
        noDataShow: false,
        receiveId: '',
        textList: [],
        // vin: '',
        options:{

        },
        list: []
      }
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
        alert(JSON.stringify(e))
      })
      Vue.wechat.ready(function () {
      })
    },
    methods: {
      // 图片预览
      previewImg(item) {
        let imgUrl = item.url;
        let imgs = [];
        imgs.push(item.url);
        Vue.wechat.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: imgs // 需要预览的图片http链接列表
        });
      },
      loadMore() {
        let self = this;
        let p = {
          operateCode: '130',
          operateName: '/质损详情',
          receiveId: self.receiveId
        }
        self.list = [];
        self.$api.post('crm/sign/echoVehicleLose', p, r => {
          console.log(r);
          if (r.repData.length == 0){
            self.noDataShow = true;
          }else{
            self.noDataShow = false;
            r.repData.forEach((item)=>{
              if(item.imgUrl.length>0){
                self.list.push(item)
              }else{
                self.list.push({
                  id: item.id,
                  loseId: item.loseId,
                  reason: item.reason
                })
              }
            })
          }
        }, e => {
          console.log(e);
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
      loadList() {
        let self = this;
        let p = {
          operateCode: '131',
          operateName: '/字典表',
        }
        self.$api.post('crm/sign/displayLoseName', p, r => {
          this.textList = r.repData;
        }, e => {
          console.log(e);
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
      changeText(val){
        let val1 = val[0];
        let val2 = val[1];
        let str = '';
        this.textList.forEach((item)=>{
          if(item.value == val1){
            str = str + item.label;
            item.children.forEach((item)=>{
              if(item.value == val2){
                str = str + ' '  + item.label;
              }
            })
          }
        })
        return str;
      }
    },
    created() {
      this.receiveId = this.$api.ssGet('detailId');
      this.loadList();
      this.loadMore();
    }
  }
</script>

<style scoped>
  .damage-img {
    padding: .3em 0;
    width: 6em;
    height: 6em;
  }

  .damage-img img {
    width: 100%;
    height: 100%;
  }
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
  .contact {
    padding: .5em 1em 0;
  }
  .list-item{
    margin-bottom: .5em;

    position: relative;
    border-bottom: 1px solid #f1f1f1;
  }
  .title{
    line-height: 3.5em;
    position:relative;
    font-size: .8em;
    color:#777777;
    /*border-bottom: 1px solid #f9f9f9;*/
    /*margin-bottom: 1em;*/
  }
  .bb{
    border-bottom: 1px solid #f9f9f9;
    padding-bottom: .8em;
  }
  .text{
    color:#7b7b7b;
    background: #f7f7f7;
    font-size: .8em;
    line-height: 1.5em;
    padding:.5em 1em;
    border-radius: 1em;
    margin-bottom: 1em;
    margin-top: 1em;
  }

</style>
