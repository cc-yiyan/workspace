<template>
  <div style="font-size: .32rem" class="login-bg" :style="{height: viewH+'px'}">
    <div class="login-logo"><img src="../../assets/img/icon_login_logo.png"></div>
    <div class="input-box">
      <div class="input-bar">
        <span class="user-icon icon-user"></span>
        <input placeholder="请输入手机号" v-model.trim="telephone" @keyup="Keyup" type="tel" maxlength="11"/>
      </div>
      <div class="input-bar">
        <span class="user-icon icon-password"></span>
        <input placeholder="请输入验证码" type="tel" maxlength="6" @keyup="Keyup" v-model.trim="code"/>
        <!--<div :class="[flag?'code-bg':'']" class="login-code" @click="getCode"><span>{{str}}</span></div>-->
        <div class="login-code" @click="getCode"><span>{{str}}</span></div>
      </div>
    </div>
    <div :class="[state?'code-bg':'']" class="login-button" @click="userLogin">登录</div>
  </div>
</template>

<script>
  let rootUrl = sessionStorage.getItem('rooturl');
  export default {
    data() {
      return {
        telephone: '',
        code: '',
        codeKey: '',
        flag: false,
        state: false,
        codeNum: false,
        str: '验证码',
        num: '',
        viewH:''
      }
    },
    mounted() {
      this.viewH = window.innerHeight;
    },
    methods: {
      Keyup() {
        this.telephone.length > 10 && !this.codeNum ? this.flag = true : this.flag = false;
        this.telephone.length > 10 && this.code.length > 5 ? this.state = true : this.state = false;
      },
      getCode() {
        var self = this;
        if (!self.flag) {
          return;
        }
        var phoneReg = /(^1[3|4|5|7|8|9]\d{9}$)|(^09\d{8}$)/;
        if (!phoneReg.test(self.telephone)) {
          self.$vux.toast.show({
            text: '请输入有效的手机号码!',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        if (this.flag) {
          self.num = 60;
          self.num--;
          self.flag = false;
          self.codeNum = true;
          self.str = self.num + 's';
          var stem = setInterval(function () {
            --self.num;
            self.str = self.num + 's';
            if (self.num == 0) {
              self.str = '验证码'
              self.flag = true;
              self.codeNum = false;
              clearInterval(stem);
            }
          }, 1000)
          var p = {
            "telephone": self.telephone
          }
          self.$api.post('crm/login/sendMessage', p, r => {
            self.codeKey = r.repData.codeKey;
          }, e => {
            console.log(e);
          })
        }
      },
      userLogin() {
        if (this.state == false){
          return
        }
        var self = this;
        var wxUser = self.$api.ssGet('wxUser');
        if (wxUser == null) {
          self.$vux.toast.show({
            text: '非注册用户，请联系客服!',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        var phoneReg = /(^1[3|4|5|7|8|9]\d{9}$)|(^09\d{8}$)/;
        if (!phoneReg.test(self.telephone)) {
          self.$vux.toast.show({
            text: '请输入有效的手机号码!',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        var p = {
          telephone: self.telephone,
          code: self.code,
          codeKey: self.codeKey,
          openIdKey: wxUser.redisKey,
          loginCode: wxUser.loginCode
        };
        self.$api.post('crm/login/validateMessage', p, r => {
          var loginCode = r.repData.loginCode;
          if(loginCode == '0002'){
            var token = r.repData.token;
            self.$api.ssSet('token', token);
            self.$router.push(rootUrl + "/info");
          }
          else if(loginCode == '0003'){
            p.loginCode = '0003';
            this.$vux.confirm.show({
              content: '更新手机号!',
              confirmText: '更新',
              onConfirm() {
                self.$api.post('crm/login/unbind', p, r => {
                  alert(JSON.stringify(r));
                  // 登录成功，存入token
                  var token = r.repData.token;
                  self.$api.ssSet('token', token);
                  self.$router.push(rootUrl + "/info");
                  // self.$router.push("/wx/info");
                }, e => {
                });
              },
              onCancel() {
                self.$api.post('crm/login/notUnbind', p, r => {
                  alert(JSON.stringify(r));
                  // 登录成功，存入token
                  var token = r.repData.token;
                  self.$api.ssSet('token', token);
                  self.$router.push(rootUrl + "/info");
                  // self.$router.push("/wx/info");
                }, e => {
                });
              },
            })
          }
          else if(loginCode == '0004'){
            p.loginCode = '0004';
            this.$vux.confirm.show({
              content: '更新手机号!',
              confirmText: '更新',
              onConfirm() {
                self.$api.post('crm/login/unbind', p, r => {
                  // 登录成功，存入token
                  var token = r.repData.token;
                  self.$api.ssSet('token', token);
                  self.$router.push(rootUrl + "/info");
                  // self.$router.push("/wx/info");
                }, e => {
                });
              },
              onCancel() {
                self.$api.post('crm/login/notUnbind', p, r => {
                  // 登录成功，存入token
                  var token = r.repData.token;
                  self.$api.ssSet('token', token);
                  self.$router.push(rootUrl + "/info");
                  // self.$router.push("/wx/info");
                }, e => {
                });
              },
            })
          }
          else if(loginCode == '0005'){
            self.$vux.toast.show({
              text: '非注册用户，请联系客服！',
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        }, e => {
          alert(JSON.stringify(e));
          return
        })
      }
    }
  }
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
    width: 2.2rem;
    height: auto;
    margin: 0 auto;
    padding-top: 2rem;
    padding-bottom: 1rem;
  }

  .login-logo > img {
    width: 100%;
  }

  .input-box {
    width: 70%;
    height: auto;
    padding: .2em 0;
    background: #fff;
    margin: 1em auto 0;
    position: relative;
    border-radius: .45em;
    -webkit-border-radius: .45em;
    overflow: hidden;
    /*line-height: 3em;*/
  }

  .input-bar {
    font-size: .28rem;
    height: 1.9em;
    padding: .8em 0;
    line-height: 1.9em;
    padding-left: 4em;
    position: relative;
    overflow: hidden;
  }

  .input-bar:first-child {
    border-bottom: 1px solid #c1c1c1;
  }

  .user-icon {
    width: 3em;
    height: 1.5em;
    border-right: 1px solid #c1c1c1;
    position: absolute;
    top: 1em;
    left: 0;
  }

  .icon-user {
    background: url("./../../assets/img/icon_user.png") no-repeat center;
    background-size: 1.4em;
  }

  .icon-password {
    background: url("./../../assets/img/icon_password.png") no-repeat center;
    background-size: 1.5em;
  }

  .input-bar > input {
    width: 100%;
    height: 100%;
    line-height: inherit;
    color: #999;
  }

  .login-code {
    position: absolute;
    top: .8em;
    right: 0;
    width: 6.5em;
    height: 100%;
    line-height: inherit;
    /*background: #ccc;*/
    color: #ff4d51;
    border: none;
    text-align: center;
  }

  .login-code > span {
    display: block;
    font-size: .9em;
  }

  .login-button {
    width: 70%;
    height: 3em;
    line-height: 3em;
    margin: 1.5em auto 3em;
    font-size: .9em;
    border-radius: .5em;
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
