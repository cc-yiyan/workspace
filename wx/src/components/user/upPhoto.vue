<template>
  <div style="font-size: .32rem;">
    <div class="info-header">
      <div class="info-bg"><img src="../../assets/img/info.png"/></div>
      <div class="info-user">
        <div class="user-img">
          <form action="/register/uploadimage" enctype="multipart/form-data" id="ff" method="post">
            <input type="file" name="file" id="file"/>
            <input type="text" name="userId" value="123344">
             <img class="headPortrait"
            @click="submit"/>
          </form>
          
        </div>
    <div class="bottom" @click="submit">完成绑定</div>
        
      </div>
      
    </div>
    
  </div>
</template>

<script>
import Vue from "vue";
import { WechatPlugin } from "vux";

Vue.use(WechatPlugin); //使用微信插件
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
      info: {},
      option1: "", // 经销商
      option2: "", // 主机厂
      options1: [],
      options2: [],
      imgToken: "",
      wechatImageUrl: require("../../assets/img/icon_info_user.png"), //保存头像地址
      iconV1: require("../../assets/img/icon-v1@2x.png"),
      iconV2: require("../../assets/img/icon-v2@2x.png"),
      iconV3: require("../../assets/img/icon-v3@2x.png"),
      imgLocalIds: "",
      viewH: "" //动态获取视窗
    };
  },
  mounted() {
    let self = this;
    this.viewH = window.innerHeight;

    let hrefUrl = window.location.href;
    // 获取微信相关信息
    // self.$api.post(
    //   "crm/wechart/getSign",
    //   { url: hrefUrl },
    //   r => {
    //     self.imgToken = r.repData.token;
    //     Vue.wechat.config({
    //       //debug: true,
    //       appId: r.repData.appId.toString(), // 必填，公众号的唯一标识
    //       timestamp: r.repData.timeStamp.toString(), // 必填，生成签名的时间戳
    //       nonceStr: r.repData.nonceStr.toString(), // 必填，生成签名的随机串
    //       signature: r.repData.sign.toString(), //必填，签名
    //       jsApiList: ["chooseImage", "uploadImage", "previewImage"]
    //     });
    //   },
    //   e => {}
    // );
  },
  methods: {
    loadData() {},
    //图片选择
    imgUp() {
      let self = this;
      console.log(12231)
      // Vue.wechat.chooseImage({
      //   //debug: true,
      //   count: 1,
      //   sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
      //   //   sourceType: ['album', 'camera'],
      //   success: function(res) {
      //     self.imgLocalIds = res.localIds[0];
      //     self.uploadImg();
      //   }
      // });
    },
    submit(){
      
    },
    // 图片上传微信服务器
    uploadImg() {
      let self = this;
      Vue.wechat.uploadImage({
        localId: self.imgLocalIds,
        success: function(res) {
          self.toUpLoad(res.serverId);
          // window.prompt('', JSON.stringify(res));
        }
      });
    },
    // 上传图片服务器，回显http地址
    toUpLoad(serverId) {
      let self = this;
      let p = {
        operateCode: "144",
        operateName: "/个人中心/上传头像",
        mediaId: serverId,
        accessToken: self.imgToken
      };
      self.$api.post(
        "file/ProfilePhotoUploadController/wechatUpload",
        p,
        r => {},
        e => {
          if (e == "" || e == null) {
            self.$vux.toast.show({
              text: "上传失败，请重试!",
              time: "2000",
              type: "text",
              position: "middle"
            });
          } else {
            self.saveHeadPhoto(e);
            console.log(e);
          }
        }
      );
    },
    //微信头像 上传后，保存接口
    saveHeadPhoto(url) {
      let self = this;
      let p = {
        appOrWechat: "1",
        wechatImageUrl: url
      };
      self.$api.post(
        "crm/appimages/saveProfileImages",
        p,
        r => {
          self.loadData();
          self.$vux.toast.show({
            text: "头像修改成功!",
            time: "2000",
            type: "text",
            position: "middle"
          });
        },
        e => {}
      );
    },
    //完成绑定的提交按钮
    subminContact() {
      let self = this;

      let p = {
        loginName: this.$route.query.loginName,
        company: this.$route.query.company,
        department: this.$route.query.department,
        mailbox: this.$route.query.mailbox,
        // imgUrl:[...(self.contact.httpPicture)]
        imgUrl: self.contact.httpPicture.toString()
      };
      self.$api.post(
        "register/saveUserInfo",
        p,
        r => {
          this.$router.push(rootUrl + "/getUserList");
        },
        e => {
          this.$message({
            message: e.repData.repMsg,
            type: "error"
          });
        }
      );
    }
  },
  created() {}
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

.headGrade {
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
.bottom {
  width: 70%;
  height: 3em;
  line-height: 3em;
  margin: 0.5em auto 3em;
  font-size: 0.9em;
  border-radius: 0.5em;
  text-align: center;
  color: #fff;
  background: #ccc;
}
</style>
