<template>
  <div style="height: 100%;font-size: .32rem;">
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="3.5em">
      <div class="">
        <ul style="padding-bottom: .5em;">
          <li v-for="(item, index) in list" class="contact-li" :key="index" @click="damage(index,item)">
            <!--{{item}}-->
            <p>{{item.vin}}</p>
            <p>{{item.carName}}</p>
            <div v-if="item.isLose == 1" class="isLose">已登记</div>
            <div v-if="item.isLose != 1" class="isLose">去登记</div>
          </li>
        </ul>
      </div>
      <!--验证码-->
      <div class="mask" v-show="batchReceipts" @click="batchReceipts = false"></div>
      <div class="code" v-show="batchReceipts">
        <input class="code-input" maxlength="6" type="text" v-model.trim="smsCode">
        <span class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="sendAuthCode" class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="!sendAuthCode" class="time time-active">{{auth_time}}s</span>
        <div class="code-btn-wrap"><span @click="cancel">取消</span><span
          style="color: #a3121a;border-left: 1px solid #fafafa;" @click="signIn">确定</span></div>
      </div>
      <div slot="bottom" class="contact-bottom">
        <span class="all-btn" @click="sureSign">确认签收</span>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {ViewBox} from 'vux'
  import Vue from 'vue'
  import {WechatPlugin} from 'vux'

  Vue.use(WechatPlugin)//使用微信插件
  let rootUrl = sessionStorage.getItem('rooturl');
  export default {
    name: "Damage",
    components: {
      ViewBox
    },
    data() {
      return {
        list: [],
        batchReceipts: false,
        smsText: '验证码',
        smsCode: "",//短信验证码
        auth_time: 59,
        codeKey: "",
        sendAuthCode: true,
        orderLatitude:"",//纬度
        orderLongitude:""//经度
      }
    },
    mounted() {
      let self = this;
      let hrefUrl = window.location.href;
      this.$api.post("crm/wechart/getSign", {url: hrefUrl}, r => {
        Vue.wechat.config({
          // debug: true,
          appId: r.repData.appId.toString(), // 必填，公众号的唯一标识
          timestamp: r.repData.timeStamp.toString(), // 必填，生成签名的时间戳
          nonceStr: r.repData.nonceStr.toString(), // 必填，生成签名的随机串
          signature: r.repData.sign.toString(),  //必填，签名
          jsApiList: ["getLocation"]
        });
      }, e => {
      })
      Vue.wechat.ready(function () {

      })
      let damageArr = this.$api.ssGet('damageArr');
      if(damageArr){
        this.list = this.$api.ssGet('damageArr');
      }
    },
    methods: {
      damage(index, item) {
        if (item.isLose == 1) {
          let editDetail = {
            index: index,
            receiveId: item.receiveId
          }
          this.$api.ssSet('editDetail', editDetail);
          this.$router.push({
            path: rootUrl + "/damageEdit"
          });
        }
        else {
          let commitDetail = {
            index: index,
            receiveId: item.receiveId
          }
          this.$api.ssSet('commitDetail', commitDetail);
          this.$router.push({
            path: rootUrl + "/damageCommit"
          });
        }
      },
      getSmsCode() {
        var self = this;
        self.sendAuthCode = false;
        self.auth_time = 59;
        var auth_timetimer = setInterval(() => {
          self.auth_time--;
          if (self.auth_time <= 0) {
            self.smsText = "重新获取"
            this.sendAuthCode = true;
            clearInterval(auth_timetimer);
          }
        }, 1000);
        var id = self.$api.ssGet('token');
        id = id.substring(0, id.indexOf('_'))
        self.$api.post("crm/sign/sendSMSCode", {operateCode: '141', operateName: '/质损中心/验证码', id: id}, success => {
          self.codeKey = success.repData.codeKey;
        }, error => {
          self.$message.error(error.repMsg);
        })
      },
      cancel() {
        var self = this;
        self.smsCode = "";
        self.batchReceipts = false;
      },
      sureSign() {
        let self=this;
        // 微信获取经纬度
        Vue.wechat.getLocation({
          type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {

            self.orderLatitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            self.orderLongitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            // var speed = res.speed; // 速度，以米/每秒计
            // var accuracy = res.accuracy; // 位置精度
          }
        });
        self.batchReceipts = true;
      },

      signIn(){
        var self=this;
        if(self.smsCode==""){
          self.$vux.toast.show({
            text: '请输入验证码',
            width: '10em',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        let _damageArr = self.$api.ssGet('damageArr');
        // self.list.forEach((item)=>{
        //   if(item.checked){
        //     arr.push({carNo:item.carNo,isLose:item.isLose,orderId:item.orderId,receiveId:item.receiveId,vin:item.vin})
        //   }
        // })
        // 直接评价传递参数

        let evalArr = [];
        _damageArr.forEach((item)=>{
          evalArr.push(item.vin)
        })
        self.$api.ssSet('evalArr',evalArr);
        var p={
          operateCode: '140',
          operateName: '/质损中心/签收提交',
          signIds:_damageArr,
          codeKey:self.codeKey,
          smsCode:self.smsCode,
          orderLatitude:self.orderLatitude,
          orderLongitude:self.orderLongitude,
          signFrom:3//签收来源 1:pc端 2:app 3:微信', （传数字）
        }

        self.$api.post("crm/sign/signOrder",p,success => {
          self.$vux.confirm.show({
            content: '是否去评价',
            confirmText: '是',
            cancelText: '否',
            hideOnBlur: true,
            onCancel () {
              sessionStorage.removeItem('damageArr');
              self.$router.push({
                path: rootUrl + "/sign"
              });
            },
            onConfirm () {
              sessionStorage.removeItem('damageArr');
              self.$router.push({
                path: rootUrl + "/evaluateSub"
              });
            }
          })
        },e => {
          if(e.repCode == '0104'){
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else{
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
      },
    },
    created() {
      // this.loadData();
    }
  }
</script>


<style scoped>
  .contact {
    padding: 0 .8em;
    height: 100%;
  }

  .contact-li {
    padding: 1em .8em;
    line-height: 1.2em;
    border-bottom: 1px solid #e2e2e2;
    position: relative;
    overflow: hidden;
    display: block;
  }

  .contact-li > p {
    font-size: .8em;
    color: #999;
  }

  /*footer*/
  .contact-bottom{
    padding: .5em;
    height: 2.5em;
    line-height: 2.5em;
    position: relative;
    margin-top: -3.5em;
    background: #ffffff;
    box-shadow: 0 -1px 5px #e2e2e2;
  }
  /*.btn-wrap {*/
    /*position: fixed;*/
    /*z-index: 98;*/
    /*width: 100%;*/
    /*bottom: 0;*/
    /*height: 2.5em;*/
    /*line-height: 2.5em;*/
    /*padding-top: .5em;*/
    /*padding-bottom: .5em;*/
    /*background: #ffffff;*/
    /*border-top: 1px solid #f2f1f1;*/
    /*box-shadow: 0 0px 2px #e2e2e2;*/
  /*}*/

  .all-btn {
    display: block;
    width: 7.5em;
    height: 100%;
    font-size: .9em;
    line-height: inherit;
    background: #ca151e;
    margin: 0 auto;
    color: #fff;
    text-align: center;
    border-radius: 2em;
  }

  .isLose {
    position: absolute;
    right: 1em;
    width: 4em;
    height: 1.8em;
    font-size: .9em;
    border: 1px solid #feb755;
    color: #feb755;
    text-align: center;
    line-height: 1.8em;
    border-radius: .9em;
    top: 1.4em;
  }

  .mask {
    width: 100%;
    height: 100%;
    z-index: 99;
    position: fixed;
    opacity: .2;
    left: 0;
    top: 0;
    background: #000000;
  }

  .code {
    width: 19em;
    height: 9em;
    margin-left: -9.5em;
    background: #fff;
    border-radius: 1em;
    margin-top: -4.5em;
    position: fixed;
    z-index: 999;
    left: 50%;
    top: 50%;
  }

  .code-input {
    position: absolute;
    border: 1px solid #eeeeee;
    height: 2.5em;
    line-height: 2.5em;
    top: 1.5em;
    left: 1em;
    border-radius: .5em;
    width: 16.5em;
    padding-left: .5em;
    background: #fff;
    outline: none;
    -webkit-appearance: none;
  }

  .code .time {
    display: inline-block;
    background: #ca151e;
    position: absolute;
    top: 2em;
    right: 1.1em;
    border-radius: 0 .5em .5em 0;
    font-size: .8em;
    height: 3.1em;
    line-height: 3em;
    text-align: center;
    color: #fff;
    width: 6em;
  }


  .code .time-active {
    background: #ddd;
  }

  .code .code-btn-wrap {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0;
    border-top: 1px solid #fafafa;
  }

  .code .code-btn-wrap span {
    display: inline-block;
    width: 49%;
    text-align: center;
    line-height: 3em;

  }
</style>
