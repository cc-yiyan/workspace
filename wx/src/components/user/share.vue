<template>
    <div class="img-bg">
        <div class="er-img"></div>
    </div>
</template>

<script>
  import Vue from 'vue'
  import {
    WechatPlugin
  } from 'vux'
  Vue.use(WechatPlugin) //使用微信插件
  const wx = Vue.wechat
  let rootUrl = sessionStorage.getItem("rooturl");
  export default {
    data() {
      return {
        openId:'',
        fromOpenId:""
      };
    },
    mounted() {
      let self = this
      let p = {}
      var getQueryString = function(paras){
        var url= window.location.href;
        var index=url.indexOf("?");
        var str=url.substr(index+1);
        var arr=str.split("&");
        var obj={};
        for (var i = 0; i < arr.length; i++) {
          var num=arr[i].indexOf("=");
          if (num>0) {
            obj[arr[i].substring(0,num)]=arr[i].substr(num+1);
          }
        }
        console.log(obj)
        var returnValue = obj[paras];
        return returnValue;
      }
      //var code = getQueryString('code');
      self.openId = getQueryString("openId");
      console.log("openid="+self.openId);
      console.log("url="+window.location.href);
      console.log("##="+ location.href.split('#')[0])
      self.fromOpenId = getQueryString("fromOpenId");

      self.$api.get("/api/weixin/sign?url=" + encodeURIComponent(location.href.split('#')[0]), p,
        r => {
          wx.config({
            debug: true,
            appId: r.data.appId, // 必填，公众号的唯一标识
            timestamp: r.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: r.data.nonceStr, // 必填，生成签名的随机串
            signature: r.data.signature, //必填，签名
            jsApiList: [
              'updateAppMessageShareData'
            ]
          });
          wx.ready(function () {
            let share = {
              title: '安吉信息安全冲顶大会', // 分享标题
              desc: '每天10题，赢8000元大奖，关注公众号还有丰厚礼品等你拿！', // 分享描述
              link: rootUrl+'/index.html#/share?fromOpenId='+self.openId, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: rootUrl+'/assets/img/share-tip.png', // 分享图标
            }
            wx.updateAppMessageShareData(share, function (res) {
              //这里是回调函数
            });
          })
        },
        e => {

        }
      );
      this.recordVisit();
      this.viewH = window.innerHeight;
    },
    methods: {
      recordVisit(){
          let self = this;
          //if(self.fromOpenId!=null&&self.fromOpenId!=undefined){
          let p = {
            openId:self.openId,
            fromOpenId:self.fromOpenId,
            url:window.location.href
          }
          self.$api.get("/share/trace", p,
            r => {
              console.log("record-view-ok:"+p.url);
            },
            e => {

            }
          );
        //}
      }
    }
  };
</script>

<style scoped>
.img-bg{
    width: 7.5rem;
    height:14rem;
    background: url("./../../assets/img/imgBgShare.jpg") no-repeat;
    background-size: 100%;
    position: relative;
}
.er-img{
    position: absolute;
    width: .7rem;
    height: .7rem;
    background-color: #000;
    bottom: .2rem;
    right: .2rem;
}
</style>
