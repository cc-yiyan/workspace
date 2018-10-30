<template>
  <div style="font-size: .32rem" class="login-bg" :style="{height: viewH+'px'}" >
    <!-- <div class="info-header"> -->
      <div class="info-bg"><img src="../../assets/img/login_bg.png" /></div>
      <div class="info-user">
        <div class="user-img">

          <input type="file" accept="image/jpeg,image/jpg,image/x-png,image/x-gif,image/webp" @change="getFile($event)" class="file-input" value="">
          <div class="u-btn">点击上传图片</div>
          <img :src="sortUrl" id="img0" width="120" class="bobo">
          <!-- <button @click="submitForm($event)">提交</button> -->

        </div>
        <div  v-if="imgDisplay" class="bottom" @click="submitForm($event)">完成绑定</div>


        <!-- -->

      </div>

    <!-- </div> -->

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
      file: "",
      sortUrl: "",
      imgDisplay: false,
    };
  },
  mounted() {
    let self = this;
    this.viewH = window.innerHeight;
  },
  methods: {
    getObjectURL(file) {
      var url = null;
      if (window.createObjectURL != undefined) {
        // basic
        url = window.createObjectURL(file);
      } else if (window.URL != undefined) {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
      }
      return url;
    },
    getFile(event) {
      this.file = event.target.files[0];
      this.sortUrl = this.getObjectURL(this.file);
      this.imgDisplay = true;
    },
    submitForm(event) {
      let self = this;
      event.preventDefault();
      var getQueryString = function(paras) {
        var url = window.location.href;
        var index = url.indexOf("?");
        var str = url.substr(index + 1);
        var arr = str.split("&");
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
          var num = arr[i].indexOf("=");
          if (num > 0) {
            obj[arr[i].substring(0, num)] = arr[i].substr(num + 1);
          }
        }
        console.log(obj);
        var returnValue = obj[paras];
        return returnValue;
      };
      let userId = getQueryString("userId");
      let formData = new FormData();
      formData.append("file", self.file);
      formData.append("userId", userId);
      let p = formData;

      self.$api.postFile(
        "/register/uploadimage",
        p,
        r => {
          self.$router.push({
            path: "/getUserList?userId="+userId
          });
        },
        e => {
          console.log(e.msg);
        },
        "file"
      );
    }
  },
  created() {}
};
</script>
<style scoped>
.login-bg {
  width: 100%;
  height: 100%;
  background: url("../../assets/img/login_bg.png") no-repeat center;
  background-size: cover;
  position: relative;
}
.info-header {
  width: 100%;
  height: auto;
  /* position: relative; */
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
  border-radius: 100%;
  overflow: hidden;
  margin: 0 auto;
  background: url("");
  text-align: center;
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
  background: #da3f51;
  /* background: #ccc; */
  position: relative;
  top: 3rem;
}

.file-input {
  height: 3.5em;
  position: relative;
  left: 0.6rem;
  top: 0.5rem;
  opacity: 0;
}

.hide {
  visibility: hidden;
}
.imgsort {
  width: 3.5em;
  height: 3.5em;
  visibility: visible;
}
.u-btn {
  color: #ccc;
  margin-bottom: 0.9rem;
}
.bobo {
  border-radius: 50%;
}
.code-bg {
  background: #ff4d51;
}
</style>
