<template>
  <div style="font-size: .32rem" class="login-bg" :style="{height: viewH+'px'}" >
    <div class="head">
      <img :src="item.headimgurl" class="user-img">
        <div style="color:#ccc">{{item.nickName}}</div>
    </div>
    <div class="middle" >
       <div class="input-bar">
         绑定号:{{item.bindNum}}
      </div>
       <div class="input-bar">
        公司:{{item.company}}
      </div>
       <div class="input-bar">
        部门:{{item.department}}
      </div>
      <div class="input-bar">
        邮箱:{{item.mailbox}}
      </div>
      <div class="input-bar">
        手机号:{{item.phone}}
      </div>
      <div class="input-bar">
        已邀请:{{item.invitedNum}}
      </div>
      <div class="input-bar">
        积分:{{item.score}}
      </div>
      <div class="input-bar">
        绑定状态:{{state}}
      </div>
    </div>
    <!-- <div class="bottom" @click="close">返回</div> -->

  </div>
</template>

<script>
export default {
  data() {
    return {
      item: {
        // nickName: "", //姓名
        // openid: "", //绑定号
        // company: "", //公司
        // department: "", //bumen
        // mailbox: "", //邮箱
        // phone: "", //手机号
        // invitedNum: "", //已邀请
        // score: "", //积分
        // auditState: "", //绑定状态,
        // headimgurl: "" //用户头像
      },
      viewH: "" //动态获取视窗大小
    };
  },
  mounted() {
    this.loadData();
    this.viewH = window.innerHeight;
  },
  methods: {
    loadData() {
      let self = this;
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
      self.$api.post(
        "register/queryUserInfo?userId="+userId,
        {},
        r => {
          console.log(r, 111);
          this.item = r.data;
          // self.item = {
          //   nickName: r.repData.nickName,
          //   openid: r.repData.openid,
          //   company: r.repData.company,
          //   department: r.repData.department,
          //   mailbox: r.repData.mailbox,
          //   phone: r.repData.phone,
          //   invitedNum: r.repData.invitedNum,
          //   score: r.repData.score,
          //   auditState: r.repData.auditState,
          //   headimgurl: r.repData.headimgurl
          // };

          // if (r.repData.imgUrl != "") {
          //   self.contact.httpPicture = r.repData.imgUrl.split(",");
          // }
          if (r.data.state == 3) {
            self.state = "已绑定";
          } else if (r.data.state == 2) {
            self.state = "审核中";
          } else {
            self.state = "未绑定";
          }
        },
        e => {
          // if (e.repCode == "0104") {
          //   sessionStorage.clear();
          //   self.$api.getId(this.$route);
          // } else {
          self.$vux.toast.show({
            text: e.repMsg,
            time: "2000",
            type: "text",
            position: "middle"
          });
          // }
        }
      );
    },
    close() {
      const self = this;
      // WeixinJSBridge.call("closeWindow");
      // this.$route.go(-1);
      self.$router.push({
        path: "/"
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
.head {
  /* text-align: center; */
  margin: 0 auto;
  margin-left: 3rem;
  padding-top: 1rem;
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
  color: #999;
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
.user-img {
  width: 3.5em;
  height: 3.5em;
  border-radius: 100%;
  overflow: hidden;
  margin: 0 auto;
}
</style>
