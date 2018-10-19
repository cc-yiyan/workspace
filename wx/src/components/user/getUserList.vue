<template>
  <div style="font-size: .32rem" class="login-bg" :style="{height: viewH+'px'}" >
    <div class="head">头像
        <span>姓名</span>
    </div>
    <div class="middle" >
       <div class="input-bar">
         绑定号:{{item.no}}
      </div>
       <div class="input-bar">
        公司:{{item.company}}
      </div>
       <div class="input-bar">
        部门:{{item.depart}}
      </div>
      <div class="input-bar">
        邮箱:{{item.mail}}
      </div>
      <div class="input-bar">
        手机号:{{item.tel}}
      </div>
      <div class="input-bar">
        已邀请:{{item.invite}}
      </div>
      <div class="input-bar">
        积分:{{item.count}}
      </div>
      <div class="input-bar">
        绑定状态:{{item.isBind}}
      </div>
    </div>
    <div class="bottom" >返回</div>
    
  </div>
</template>

<script>
export default {
  data() {
    return {
      item: {
        no: 111,
        company: "安吉",
        depart: "",
        mail: "",
        tel: "",
        invite: "",
        count: "",
        isBind: ""
      },

      viewH: "" //动态获取视窗大小
    };
  },
  mounted() {
    this.viewH = window.innerHeight;
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
.head {
  /* text-align: center; */
  margin: 0 auto;
  margin-left: 3rem;
  padding-top: 2rem;
  /* padding-bottom: 1rem; */
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

.middle {
  width: 70%;
  height: auto;
  background: #fff;
  margin: 0em auto 0.5rem;
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
</style>