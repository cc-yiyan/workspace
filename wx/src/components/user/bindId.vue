<template>
  <div style="font-size: .32rem" class="login-bg" :style="{height: viewH+'px'}">
    <!-- <div class="login-logo"><img src="../../assets/img/icon_login_logo.png"></div> -->
    <div class="login-logo"><span>绑定身份信息</span></div>
    
    <div class="input-box">
         <div class="input-bar">
        <!-- <input placeholder="姓名" v-model.trim="telephone" @keyup="Keyup" type="tel" maxlength="11"/> -->
            <input placeholder="姓名" v-model="loginName"/>
          </div>
       <div class="input-bar">
        <input placeholder="公司" v-model="company"/>
      </div>
       <div class="input-bar">
        <input placeholder="部门" v-model="department"/>
      </div>
       <div class="input-bar">
        <input placeholder="邮箱" v-model="mailbox"/>
      </div>
      <div class="input-bar">
        <input placeholder="请输入手机号" v-model.trim="telephone" @keyup="Keyup" type="tel" maxlength="11"/>
      </div>
      <div class="input-bar">
        <input placeholder="请输入验证码" type="tel" maxlength="6" @keyup="Keyup" v-model.trim="codes"/>
        <div class="login-code" @click="getCode"><span>{{str}}</span></div>
      </div>
    </div>
    <div :class="[state?'code-bg':'']" class="login-button" @click="codeCheck">下一步</div>
  </div>
</template>

<script>
// let rootUrl = sessionStorage.getItem("rooturl");
export default {
  data() {
    return {
      telephone: "", //手机号
      codes: "", //验证码
      code: "", //验证码发送成功的返回值
      flag: false,
      state: false, //是否注册

      codeNum: false,
      str: "验证码",
      num: "",
      loginName: "", //用户名
      company: "", //公司
      department: "", //部门
      mailbox: "", //邮箱

      viewH: ""
    };
  },
  mounted() {
    let self=this
    let p={}
    self.$api.get(
          "/api/wechat/oauth2?state=test&scope=base&callback=http://f64e9eee.ngrok.io/api/wechat/getActQRCode?channel=test",
          
          r => {
            console.log(r)
          },
          e => {
            console.log(e);
          }
        );
    this.viewH = window.innerHeight;
  },
  methods: {
    Keyup() {
      this.telephone.length > 10 && !this.codeNum
        ? (this.flag = true)
        : (this.flag = false);
      this.telephone.length > 10 && this.codes.length > 5
        ? (this.state = true)
        : (this.state = false);
    },
    getCode() {
      var self = this;
      if (!self.flag) {
        return;
      }
      var phoneReg = /(^1[3|4|5|7|8|9]\d{9}$)|(^09\d{8}$)/;
      if (!phoneReg.test(self.telephone)) {
        self.$vux.toast.show({
          text: "请输入有效的手机号码!",
          time: "2000",
          type: "text",
          position: "middle"
        });
        return;
      }
      if (this.flag) {
        self.num = 60;
        self.num--;
        self.flag = false;
        self.codeNum = true;
        self.str = self.num + "s";
        var stem = setInterval(function() {
          --self.num;
          self.str = self.num + "s";
          if (self.num == 0) {
            self.str = "验证码";
            self.flag = true;
            self.codeNum = false;
            clearInterval(stem);
          }
        }, 1000);
        var p = {
          telephone: self.telephone
        };
        self.$api.post(
          "register/sendCodeSMS",
          p,
          r => {
            self.code = r.repData.code;
          },
          e => {
            console.log(e);
          }
        );
      }
    },
    // 下一步上传照片
    // userphoto() {
    //   const self = this;
    //   this.$router.push({

    //     path: rootUrl + "/upPhoto",
    //     query: {
    //       loginName: this.loginName,
    //       company: this.company,
    //       department: this.department,
    //       mailbox: this.mailbox
    //     }
    //   });
    // }
    //验证码校验
    codeCheck() {
      const self = this;
      var p = {
        smsId: self.smsId,
        smsCode: self.smsCode
      };
      self.$api.post(
        "register/codeSMSValid",
        p,
        success => {
          self.code = success.repData.code;
        },
        e => {
          this.$message({
            message: e.repData.repMsg,
            type: "error"
          });
        }
      ),
        userphoto();
    },
    //点击下一步用户头像上传
    userphoto() {
      const self = this;
      this.$router.push({
        path: rootUrl + "/upPhoto",
        query: {
          loginName: this.loginName,
          company: this.company,
          department: this.department,
          mailbox: this.mailbox
        }
      });
    }
  }
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

.login-logo {
  text-align: center;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 1rem;
}

.input-box {
  width: 70%;
  height: auto;
  background: #fff;
  margin: 1em auto 1rem;
  position: relative;
  border-radius: 0.45em;
  -webkit-border-radius: 0.45em;
  overflow: hidden;
}

.input-bar {
  font-size: 0.28rem;
  /* height: 1.9em; */
  padding: 0.8em 0rem;
  line-height: 1.9em;
  padding-left: 1em;
  position: relative;
  overflow: hidden;
}

.input-bar > input {
  width: 100%;
  height: 100%;
  line-height: inherit;
  color: #999;
}
.login-code {
  position: absolute;
  top: 0.8em;
  right: 0;
  width: 6.5em;
  height: 100%;
  line-height: inherit;
  color: #ff4d51;
  border: none;
  text-align: center;
}

.login-code > span {
  display: block;
  font-size: 0.9em;
}

.login-button {
  width: 70%;
  height: 3em;
  line-height: 3em;
  margin: 1.5em auto 3em;
  font-size: 0.9em;
  border-radius: 0.5em;
  text-align: center;
  color: #fff;
  background: #ccc;
}

.code-bg {
  background: #ff4d51;
}

.input-box > input:-ms-input-placeholder {
  color: #999;
  opacity: 1;
}

.input-box > input::-webkit-input-placeholder {
  color: #999;
  opacity: 1;
}
</style>
