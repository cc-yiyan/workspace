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
      let self = this;
      let p = {};

      //var code = getQueryString('code');
      self.openId = self.getQueryString("openId");
      console.log("url="+window.location.href);
      console.log("sign-url="+ location.href.split('#')[0])
      self.fromOpenId = self.getQueryString("fromOpenId");
      console.log("openId="+self.openId);
      console.log("fromOpenId="+self.fromOpenId);
      this.recordVisit();

      self.$api.get("/api/weixin/sign?url=" + encodeURIComponent(location.href.split('#')[0]), p,
        r => {
          wx.config({
            debug: false,
            appId: r.data.appId, // 必填，公众号的唯一标识
            timestamp: r.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: r.data.nonceStr, // 必填，生成签名的随机串
            signature: r.data.signature, //必填，签名
            jsApiList: [
              'onMenuShareAppMessage', //1.0 分享到朋友
              'onMenuShareTimeline', //1.0分享到朋友圈
              'updateAppMessageShareData', //1.4 分享到朋友
              'updateTimelineShareData', //1.4分享到朋友圈
            ]
          });
          wx.ready(function () {
            let shareData = {
              title: '安吉信息安全冲顶大会', // 分享标题
              desc: '每天10题，赢8000元大奖，关注公众号还有丰厚礼品等你拿！', // 分享描述
              link: 'http://'+rootUrl+'/index.html#/share?fromOpenId='+self.openId, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: 'http://'+rootUrl+'/assets/img/share-tip.png', // 分享图标
            }
            /*wx.updateAppMessageShareData(shareData, function (res) {
              //这里是回调函数
            });*/
            if(wx.onMenuShareAppMessage){ //微信文档中提到这两个接口即将弃用，故判断
              wx.onMenuShareAppMessage(shareData);//1.0 分享到朋友
              wx.onMenuShareTimeline(shareData);//1.0分享到朋友圈
            }else if(wx.updateAppMessageShareData){
              wx.updateAppMessageShareData(shareData);//1.4 分享到朋友
              wx.updateTimelineShareData(shareData);//1.4分享到朋友圈
            }
            //https://blog.csdn.net/qq_36584352/article/details/82665893
          })
        },
        e => {

        }
      );
      this.viewH = window.innerHeight;
    },
    methods: {
      getQueryString(paras){
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
      },

      recordVisit(){
        var uv = getQueryString("uvFlag");
        console.log("uv="+uv);
        //if(!"1"==""+uv || uv==undefined) {
          console.log("uv-visit:" + self.openId);
          self.$api.get("/share/uv?openId=" + self.openId, {},
            r => {
              if(r.data!=null) {
                //console.log("record-uv-ok:" + p.url + "," + p.openId + "," + p.fromOpenId);
                console.log("redirect-url:" + r.data);
                window.location.href = r.data;
              }else {
                console.log("visit-url-yourself");
              }
            },
            e => {
              console.log("uv-visit-error:", e);
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
    background-image: url("./../../assets/img/er.jpg");
    background-size: 100%;
}
</style>
