<template>
  <div style="font-size: .32rem;">
    <div class="info-header">
      <div class="info-bg"><img src="../../assets/img/info.png" /></div>
      <div class="info-user">
        <div class="user-img">


        </div>

        <form>

          <input type="file" @change="getFile($event)">
          <button @click="submitForm($event)">提交</button>
        </form>

        <!-- <div class="bottom" @click="upFile">完成绑定</div> -->

      </div>

    </div>

  </div>
</template>

<script>
  import Vue from "vue";
  import {
    WechatPlugin
  } from "vux";
  import $ from 'jquery'
  Vue.use(WechatPlugin); //使用微信插件
  let rootUrl = sessionStorage.getItem("rooturl");
  import {
    PopupRadio
  } from "vux";
  export default {
    name: "info",
    components: {
      PopupRadio
    },
    data() {
      return {
        file: '',

      };
    },
    mounted() {
      let self = this;
      this.viewH = window.innerHeight;


    },
    methods: {

      getFile(event) {
        this.file = event.target.files[0];
      },
      submitForm(event) {
        let self=this
        event.preventDefault();
        let formData = new FormData();
        formData.append('file', self.file);
        formData.append('userId','123123')
       let p=formData
       
      self.$api.postFile(
          "/register/uploadimage",
          p,
          r => {
          },
          e => {
            self.$message({
              message: e.repData.repMsg,
              type: "error"
            });
          },
          'file'
        );
        
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

  .info-bg>img {
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
