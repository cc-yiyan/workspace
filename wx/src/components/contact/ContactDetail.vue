<template>
  <div style="font-size: 0.32rem; width: 100%; height: 100%;">
    <div class="contact-state" v-if="ishandle == 1 && ishandle != ''">
      <span class="contact2">处理完成</span>
    </div>
    <div class="contact-state" v-if="ishandle == 0 && ishandle != ''">
      <span class="contact1">已提交</span>
    </div>
    <div class="contact">
      <div class="contact-type"><p>{{selectTitle}}</p></div>
      <div class="contact-box" style="margin-top: 1em;">
        <div class="contact-li" v-if="contact.vin != null && contact.vin != ''">
          <span style="color: #666;">VIN码：</span><span>{{contact.vin}}</span>
        </div>
        <div class="contact-li" v-if="contact.title != null && contact.title != ''">
          <span style="color: #666;">主题：</span><span>{{contact.title}}</span>
        </div>
        <div class="contact-li" v-if="contact.phone != null && contact.phone != ''">
          <span style="color: #666;">联系方式：</span><span>{{contact.phone}}</span>
        </div>
        <div class="contact-li" v-if="contact.email != null && contact.email != ''">
          <span style="color: #666;">联系邮箱：</span><span>{{contact.email}}</span>
        </div>
        <div class="contact-li" style="border-top: 1px solid #e1e1e1; margin-top: .5em; padding-top: .5em;" v-if="contact.textarea != null && contact.textarea != ''">
          <span style="color: #666;">详细内容：</span><span>{{contact.textarea}}</span>
        </div>
        <!--<div class="contact-li" v-if="contact.vin != null && contact.vin != ''">-->
        <!--<input v-model="contact.vin" readonly/>-->
        <!--</div>-->
        <!--<div class="contact-li" v-if="contact.title != null && contact.title != ''">-->
        <!--<input v-model="contact.title" readonly/>-->
        <!--</div>-->
        <div class="damage-img-box">
          <div class="damage-img" v-for="(item,index) in contact.httpPicture" @click="previewImg(index)">
            <img :src="item"/>
          </div>
        </div>

      </div>
      <div class="contact-box" style="margin-top: 1em;" v-if="ishandle == 1 && contact.back != '' ">
        <div class="contact-li">
          <span style="color: #666;">客服反馈：</span><span>{{contact.back}}</span>
        </div>
      </div>
      <!--<div class="contact-li" v-if="contact.vin != null && contact.vin != ''">-->
      <!--<input v-model="contact.vin" readonly/>-->
      <!--</div>-->
      <!--<div class="contact-li" v-if="contact.title != null && contact.title != ''">-->
      <!--<input v-model="contact.title" readonly/>-->
      <!--</div>-->
      <!--<div class="contact-li" v-if="contact.phone != null && contact.phone != ''">-->
      <!--<input v-model="contact.phone" readonly/>-->
      <!--</div>-->
      <!--<div class="contact-li" v-if="contact.email != null && contact.email != ''">-->
      <!--<input v-model="contact.email" readonly/>-->
      <!--</div>-->
      <!--<div class="contact-textarea" v-if="contact.textarea != null && contact.textarea != ''">-->
      <!--<textarea v-model="contact.textarea" readonly></textarea>-->
      <!--</div>-->
      <!--<div class="contact-textarea" v-if="ishandle == 1">-->
      <!--<textarea v-model="contact.back" readonly></textarea>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {WechatPlugin} from 'vux'
  Vue.use(WechatPlugin)//使用微信插件
  export default {
    name: 'contact',
    data() {
      return {
        imgToken:'',
        selectTitle: '',
        ishandle: '1',
        contact: {
          vin: '',
          title: '',
          phone: '',
          email: '',
          textarea: '',
          back: '',
          httpPicture:[]
        }
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
          jsApiList: ["previewImage"]
        });
      }, e => {
      })
      Vue.wechat.ready(function () {

      })
    },
    methods: {
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
      loadData() {
        let self = this;
        self.$api.post('crm/comment/getByKey', {id: this.$route.query.id,operateCode: '104', operateName: '/投诉中心/详情'}, r => {
          self.ishandle = r.repData.ishandle;
          if (r.repData.type == "0") {
            self.selectTitle = '投诉';
          }
          else if (r.repData.type == "1") {
            self.selectTitle = '建议';
          }
          else if (r.repData.type == "2") {
            self.selectTitle = '其他';
          }
          self.contact = {
            vin: r.repData.vin,
            title: r.repData.title,
            phone: r.repData.phone,
            email: r.repData.email,
            textarea: r.repData.contents,
            back: r.repData.reply
          }
          if(r.repData.imgUrl!=""){
            self.contact.httpPicture=r.repData.imgUrl.split(",")
          }
        }, e => {
          if (e.repCode == '0104') {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
      }
    },
    created() {
      this.loadData()
    }
  }
</script>
<style scoped>
  .contact-state {
    width: 100%;
    height: 3.5em;
    line-height: 3.5em;
    background: #C7111A;
    color: #fff;
    position: relative;
  }

  .contact1 {
    height: 100%;
    line-height: inherit;
    display: block;
    background: url("./../../assets/img/contact1.png") no-repeat right center;
    background-size: 1.8em 1.5em;
    position: absolute;
    right: .8em;
    padding-right: 2.5em;
  }

  .contact2 {
    height: 100%;
    line-height: inherit;
    display: block;
    background: url("./../../assets/img/contact2.png") no-repeat right center;
    background-size: 1.5em 1.4em;
    position: absolute;
    right: 1em;
    padding-right: 2.5em;
  }

  .contact {
    padding: 0 .8em .5em;
  }

  .contact-type {
    padding: 0 .5em;
    height: 3em;
    line-height: 3em;
    border-bottom: 1px solid #e2e2e2;
    color: #999;
  }

  .contact-type p {
    height: 100%;
    line-height: inherit;
    padding-left: 1.2em;
    font-size: .85em;
    background: url("./../../assets/img/icon_arrow_line.png") no-repeat 0 center;
    background-size: .2em 1.4em;
  }

  .contact-box {
    padding: .5em;
    background: #f5f5f5;
  }

  .contact-li {
    line-height: 1.4em;
    padding: .2em 0;
    font-size: .85em;
    color: #999;
    word-break:break-all;
    word-wrap:break-word;
  }

  /*.contact-li > p {*/
    /*font-size: .9em;*/
    /*color: #999;*/
  /*}*/

  /*.contact-li > span {*/
    /*width: 0;*/
    /*height: 0;*/
    /*border-width: .3em .4em 0;*/
    /*border-style: solid;*/
    /*border-color: #999 transparent transparent;*/
    /*position: absolute;*/
    /*top: 1.2em;*/
    /*right: .8em;*/
  /*}*/

  /*.contact-li > input {*/
    /*width: 100%;*/
    /*height: 100%;*/
    /*font-size: .9em;*/
    /*color: #999;*/
    /*background: none;*/
  /*}*/

  /*.contact-textarea {*/
    /*height: 6.4em;*/
    /*border: 1px solid #e2e2e2;*/
    /*margin-top: .5em;*/
    /*padding: .4em .5em;*/
  /*}*/

  /*.contact-textarea > textarea {*/
    /*width: 100%;*/
    /*height: 100%;*/
    /*font-size: .9em;*/
    /*line-height: 1.2em;*/
    /*color: #999;*/
    /*padding: 0;*/
    /*border: none;*/
    /*resize: none;*/
  /*}*/

  /*.contact-li > input:-ms-input-placeholder {*/
    /*color: #999;*/
    /*opacity: 1;*/
  /*}*/

  /*.contact-textarea > textarea:-ms-input-placeholder {*/
    /*color: #999;*/
    /*opacity: 1;*/
  /*}*/

  /*.contact-li > input::-webkit-input-placeholder {*/
    /*color: #999;*/
    /*opacity: 1;*/
  /*}*/

  /*.contact-textarea > textarea::-webkit-input-placeholder {*/
    /*color: #999;*/
    /*opacity: 1;*/
  /*}*/
  .damage-img-box {
    width: 100%;
    margin-top: .5em;
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
</style>
