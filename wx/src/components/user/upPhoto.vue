<template>
  <div style="font-size: .32rem;">
    <div class="info-header">
      <div class="info-bg"><img src="../../assets/img/info.png" /></div>
      <div class="info-user">
        <div class="user-img">

          <input type="file" @change="getFile($event)" class="file-input" value="">
          <div class="u-btn">点击上传</div>
          <img :src="sortUrl" id="img0" width="120" >
          <!-- <button @click="submitForm($event)">提交</button> -->

        </div>
        <div v-if="imgDisplay" class="bottom" @click="submitForm($event)">完成绑定</div>


        <!-- -->

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
        sortUrl: '',
        imgDisplay: false

      };
    },
    mounted() {
      let self = this;
      this.viewH = window.innerHeight;


    },
    methods: {
      getObjectURL(file) {
        var url = null;
        if (window.createObjectURL != undefined) { // basic
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
        this.sortUrl = this.getObjectURL(this.file)
        this.imgDisplay = true
      },
      submitForm(event) {
        let self = this
        event.preventDefault();
        let formData = new FormData();
        formData.append('file', self.file);
        formData.append('userId', '123123')
        let p = formData

        self.$api.postFile(
          "/register/uploadimage",
          p,
          r => {


            self.$router.push({
              path: '/getUserList'
            })
          },
          e => {
            console.log(e.msg)
          },
          'file'
        );

      },





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
    border-radius: 100%;
    overflow: hidden;
    margin: 0 auto;
    background: url('');
    text-align: center
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
    background:#da3f51;
    position: relative;
    top: 3rem;
  }

  .file-input {
    height: 3.5em;
    position: relative;
    left: .6rem;
    ;
    top: .5rem;
    opacity: 0;
  }

  .hide {
    
    visibility: hidden;
  }
  .imgsort{
    width: 3.5em;
    height: 3.5em;
    visibility: visible;
  }
  .u-btn{
    color: #fff;
    margin-bottom: .9rem;
  }
</style>
