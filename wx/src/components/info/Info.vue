<template>
  <div style="font-size: .32rem;">
    <div class="info-header">
      <div class="info-bg"><img src="../../assets/img/info.png"/></div>
      <div class="info-user">
        <div class="user-img">
          <img class="headPortrait"
            :src="info.wechatImageUrl?info.wechatImageUrl:wechatImageUrl"
            @click="imgUp"/>
          <img v-show="info.accountGrade=='V1'" class="headGrade" :src="iconV1"/>
          <img v-show="info.accountGrade=='V2'" class="headGrade" :src="iconV2"/>
          <img v-show="info.accountGrade=='V3'" class="headGrade" :src="iconV3"/>
        </div>
        <div class="user-name">{{info.custName}}</div>
      </div>
    </div>
    <div class="info-list">
      <!--<div class="info-li">-->
        <!--<p>经销商</p>-->
        <!--<p class="info-right">经销商经销商</p>-->
      <!--</div>-->
      <div class="info-li2" v-if="info.custType == 3">
        <p style="line-height: 3.5em;">经销商</p>
        <p class="info-right-name" v-if="options1.length == 1">{{option1}}</p>
        <p class="info-right-name" v-else>
          <popup-radio :options="options1" v-model="option1" @on-hide="choose()" style="padding: 0;"></popup-radio>
        </p>
      </div>
      <div class="info-li" v-if="info.custType == 1">
        <p>用户</p>
        <p class="info-right">安吉物流</p>
      </div>
      <div class="info-li2" v-if="info.custType == 2">
        <p>主机厂</p>
        <p class="info-right-name">{{option2}}</p>
      </div>
      <div class="info-li" @click="toTel">
        <p>客服电话</p>
        <p class="info-right"></p>
        <!--<a href="tel:400-803-5706">400-803-5706</a>-->
      </div>
      <div class="info-li" @click="toContactList" v-if="info.custType == 3">
        <p>投诉与建议</p>
        <p class="info-right"></p>
      </div>
      <!-- 签收协议只允许经销商查看呢 -->
      <div class="info-li" @click="toAgree" v-if="info.custType == 3">
        <p>签收协议<span>{{isAccept == 1 ?'（您已开通电子签收权限）':'（您尚未开通电子签收权限）'}}</span></p>
        <p class="info-right"></p>
      </div>
      <div class="info-li" @click="toHelp">
        <p>帮助</p>
        <p class="info-right"></p>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
import {WechatPlugin} from 'vux'

Vue.use(WechatPlugin)//使用微信插件
let rootUrl = sessionStorage.getItem("rooturl");
import { PopupRadio } from "vux";
export default {
  name: "info",
  components: {
    PopupRadio
  },
  data() {
    return {
      isAccept: 1,
      // 保存用户信息
      info: {

      },
      option1: "", // 经销商
      option2: "", // 主机厂
      options1: [],
      options2: [],
      imgToken: '',
      wechatImageUrl:require('../../assets/img/icon_info_user.png'),//保存头像地址
      iconV1:require('../../assets/img/icon-v1@2x.png'),
      iconV2:require('../../assets/img/icon-v2@2x.png'),
      iconV3:require('../../assets/img/icon-v3@2x.png'),
      imgLocalIds:"",
    };
  },
  mounted() {
    let self = this;
    let hrefUrl = window.location.href;
    // 获取微信相关信息
    self.$api.post("crm/wechart/getSign", {url: hrefUrl}, r => {
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
  },
  methods: {
    toHelp() {
      this.$router.push(rootUrl + "/help");
    },
    toAgree() {
      this.$router.push(rootUrl + "/agreeText");
    },
    toTel() {
      this.$router.push(rootUrl + "/telService");
    },
    loadData() {
      var self = this;
      var p = {
        operateCode: "100",
        operateName: "/客户中心"
      };
      self.$api.post(
        "crm/userInformation/getUserInformation",
        p,
        r => {
          self.info = r.repData;
        },
        e => {
          if (e.repCode == "0104") {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          } else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: "2000",
              type: "text",
              position: "middle"
            });
          }
        }
      );
      var id = self.$api.ssGet("token");
      // console.log(id)
      id = id.substring(0, id.indexOf("_"));
      self.$api.post(
        "crm/customer/getByPrimaryKey",
        {
          id: id
        },
        r => {
          // self.$api.ssSet('user', r.repData);
          if (r.repData.custType == 3) {
            self.option1 = r.repData.name;
            self.options2 = r.repData.crmAuthList;
            if (r.repData.crmAuthList) {
              r.repData.crmAuthList.forEach(item => {
                self.options1.push(item.name);
              });
            }
          } else if (r.repData.custType == 2) {
            let arr = [];
            arr = r.repData.dimCustVoList.map(function(item) {
              return item.dimName;
            });
            self.option2 = arr.join(",");
          }
          // this.userId = r.repData.custType
          // this.options = r.repData.crmAuthList
          // this.value = r.repData.name
          // this.user.custType = r.repData.custType
          // self.$api.sSetObject('_user', this.user);
        },
        e => {
          console.log(e);
        }
      );
    },
    choose() {
      var self = this;
      var o = null;
      self.options2.forEach(item => {
        if (item.name == self.option1) {
          o = item;
          return;
        }
      });
      var p = {
        brandCode: o.dimCode,
        dimId: o.dimId,
        isAccept: o.isAccept,
        newDealerCode: o.crmDelarCode,
        newDealerId: o.crmDelarId,
        type: o.type
      };
      // console.log(p);
      this.$api.post(
        "crm/customer/setDefaultDealer",
        p,
        r => {
          self.$vux.toast.show({
            text: "修改成功!",
            time: "2000",
            type: "text",
            position: "middle"
          });
          return;
        },
        e => {
          // console.log(e);
        }
      );
    },
    //图片选择
    imgUp() {
      let self = this;
      Vue.wechat.chooseImage({
        //debug: true,
        count: 1,
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      //   sourceType: ['album', 'camera'],
        success: function (res) {
          self.imgLocalIds = res.localIds[0];
          self.uploadImg();
        }
      });
    },
    // 图片上传微信服务器
    uploadImg() {
      let self = this;
      Vue.wechat.uploadImage({
        localId: self.imgLocalIds,
        success: function (res) {
          self.toUpLoad(res.serverId)
          // window.prompt('', JSON.stringify(res));
        },
      });
    },
    // 上传图片服务器，回显http地址
    toUpLoad(serverId) {
      let self = this;
      let p = {
        operateCode: '144',
        operateName: '/个人中心/上传头像',
        mediaId: serverId,
        accessToken: self.imgToken
      }
      self.$api.post("file/ProfilePhotoUploadController/wechatUpload", p, r => {

      }, e => {
        if(e==""||e==null){
          self.$vux.toast.show({
            text: "上传失败，请重试!",
            time: "2000",
            type: "text",
            position: "middle"
          });
        }else{
          self.saveHeadPhoto(e)
        }

      })
    },
    //微信头像 上传后，保存接口
    saveHeadPhoto(url){
      let self=this;
      let p = {
        appOrWechat: '1',
        wechatImageUrl:url
      }
      self.$api.post("crm/appimages/saveProfileImages", p, r => {
        self.loadData();
        self.$vux.toast.show({
          text: "头像修改成功!",
          time: "2000",
          type: "text",
          position: "middle"
        });
      }, e => {

      });
    },
    toContactList() {
      this.$router.push(rootUrl + "/contactList");
    }
  },
  created() {
    //获取是否签署协议
    let self = this;
    var id = self.$api.ssGet("token");
    id = id.substring(0, id.indexOf("_"));
    self.$api.post(
      "crm/customer/getByPrimaryKey",
      {
        id: id
      },
      r => {
        self.isAccept = r.repData.isAccept ? r.repData.isAccept : 0;
      },
      e => {
        console.log(e);
      }
    );
    this.loadData();
  }
};
</script>
<style scoped>
.info-header {
  width: 100%;
  height: auto;
  position: relative;
}

.info-bg > img {
  width: 100%;
}

.info-user {
  width: 100%;
  position: absolute;
  top: 2.5em;
}

.user-img {
  width: 3.5em;
  height: 3.5em;
  border-radius: 100%;
  overflow: hidden;
  margin: 0 auto;
}

.headGrade{
  width: 0.9em;
  height: 0.8em;
  position: absolute;
  left: 53%;
  top: 50%;
}

.headPortrait {
  width: 100%;
  height: 100%;
}

.user-name {
  margin-top: 1em;
  font-size: 0.9em;
  color: #fff;
  text-align: center;
}
.info-list {
  padding: 0 0.8em;
}
.info-li {
  padding: 0 0.5em;
  height: 3.5em;
  line-height: 3.5em;
  position: relative;
  border-bottom: 1px solid #e2e2e2;
  color: #999;
}
.info-li > p {
  font-size: 0.9em;
}
.info-li > span,
.info-li > a {
  font-size: 0.9em;
  color: #f3d19e;
  position: absolute;
  top: 0;
  right: 0.5em;
  display: block;
}
.info-li > i {
}
.info-right {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0.5em;
  background: url("./../../assets/img/icon_right.png") no-repeat right center;
  background-size: 0.4em 0.8em;
  text-align: right;
  padding-right: 0.9em;
  font-size: 0.9em;
  font-weight: normal;
}
.info-li2 {
  padding: 0 0.5em;
  min-height: 3.5em;
  /*line-height: 3.5em;*/
  position: relative;
  border-bottom: 1px solid #e2e2e2;
  color: #999;
}
.info-li2 > p {
  font-size: 0.9em;
}
.info-right-name {
  padding: 0.8em 0em 0.8em 6em;
  line-height: 1.2em;
  position: absolute;
  top: 0;
  right: 0.5em;
  background: url("./../../assets/img/icon_right.png") no-repeat right center;
  background-size: 0.4em 0.8em;
  text-align: right;
  padding-right: 0.9em;
  font-size: 0.9em;
  font-weight: normal;
}
</style>
