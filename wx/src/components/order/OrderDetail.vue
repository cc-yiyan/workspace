<template>
  <div style="height: 100%;font-size: .32rem;">
    <view-box ref="viewBox" :body-padding-top="order.receiver?'8em':'6em'" body-padding-bottom="3.5em">
      <div class="detail-title">
        <div class="datail-vin">{{order.vin}}</div>
        <div class="datail-add">
          <p>
            <!--<span v-if="order.orderDestPName != null">{{order.orderDestPName}}&nbsp;/&nbsp;</span><span-->
            <!--v-if="order.orderDestCName != null">{{order.orderDestCName}}&nbsp;/&nbsp;</span><span-->
            <!--v-if="order.orderDestAName != null">{{order.orderDestAName}}&nbsp;/&nbsp;</span><span-->
            <!--v-if="order.orderDestWhName != null">{{order.orderDestWhName}}</span>-->
            <span>{{order.orderDestWhName}}</span>
            <!--<span>{{order.orderDestAddress}}</span>-->
          </p>
          <p v-if="order.otd != null && order.otd != ''">
            预计到达时间：<span style="color: #ff4d51; font-weight: 600;">{{order.otd}}</span>
          </p>
          <!-- 签收状态 0：已送达；1:已签收；其他：已发运（isReceive=0表示已到达；isReceive=1表示已签收；以外：已发运） -->
          <p v-if="order.isReceive==1">签收人：{{order.receiver}}</p>
          <!-- isLose：1是有质损，0是没有质损 -->
          <span class="detail" v-if="order.isLose==1" @click="toDetail">详情</span>
          <!--<div v-if="order.orderStatus != null" class="fy-status">{{order.orderStatus}}</div>-->
        </div>
      </div>

      <div class="detail-main" :style="{ paddingBottom: pb }">
        <div class="detail-li" v-for="item in order.shipmentInfoList">
          <div class="detail-date">{{item.time.substr(0,10)}}<br/>{{item.time.substr(10,6)}}</div>
          <div class="detail-sign"></div>
          <div class="detail-ex">
            <p style="font-size: .8em;">{{item.shipmentStatus}}<br/>{{item.province+item.city+item.address}}</p>
            <!--<p style="font-size: .8em;">{{item.orderStatus}}&nbsp;&nbsp;{{item.address ? item.address : (item.city +-->
              <!--item.district)}}</p>-->
            <!--<p style="font-size: .8em;">[{{item.shipmentStatus}}]</p>-->
          </div>
        </div>
      </div>
      <div v-if="order.shipmentInfoList && order.shipmentInfoList.length == 0" class="no-data">暂无数据</div>
      <!--验证码-->
      <div class="mask" v-show="batchReceipts" @click="batchReceipts = false"></div>
      <div class="code" v-show="batchReceipts">
        <input class="code-input" maxlength="6" type="text" v-model.trim="smsCode">
        <span class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="sendAuthCode" class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="!sendAuthCode" class="time time-active">{{auth_time}}s</span>
        <div class="code-btn-wrap"><span @click="cancel">取消</span><span @click="signIn"
                                                                        style="color: #a3121a;border-left: 1px solid #fafafa;">确定</span>
        </div>
      </div>
      <div slot="bottom" class="contact-bottom" v-if="btnShow">
        <span class="all-btn" @click="sureSign">确认签收</span>
      </div>
    </view-box>

  </div>
</template>

<script>
  let rootUrl = sessionStorage.getItem('rooturl');
  import {ViewBox, Scroller, Search, Tab, TabItem, Confirm} from 'vux'

  export default {
    name: "OrderDetail", components: {
      ViewBox,
      Scroller,
      Search,
      Tab,
      TabItem,
      Confirm
    },
    data() {
      return {
        pb: '0',
        signPrams: null,
        isAccept: 0,
        canReceive: 0,
        batchReceipts: false,
        smsText: '验证码',
        smsCode: "",//短信验证码
        auth_time: 59,
        codeKey: "",
        sendAuthCode: true,
        order: {},
        btnShow: false,
        pramsData: null
      }
    },
    methods: {
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
        self.$api.post("crm/sign/sendSMSCode", {operateCode: '112', operateName: '/签收中心/验证码', id: id}, success => {
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
      //最后提交签收
      signIn() {
        var self = this;
        let arr = [];
        // self.list.forEach((item)=>{
        //   if(item.checked){
        //     arr.push({carNo:item.carNo,isLose:item.isLose,orderId:item.orderId,receiveId:item.receiveId,vin:item.vin})
        //   }
        // })
        arr.push(self.pramsData)
        // 直接评价传递参数
        let evalArr = [];
        arr.forEach((item) => {
          evalArr.push(item.vin)
        })
        self.$api.ssSet('evalArr', evalArr);
        var p = {
          operateCode: '113',
          operateName: '/签收中心/签收提交',
          signIds: arr,
          codeKey: self.codeKey,
          smsCode: self.smsCode
        }
        if (self.smsCode == "") {
          self.$vux.toast.show({
            text: '请输入验证码',
            width: '10em',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        // if(self.codeKey==""){
        //   self.$message.error("请获取正确验证码");
        //   return;
        // }
        self.$api.post("crm/sign/signOrder", p, success => {
          self.$vux.confirm.show({
            content: '是否去评价',
            confirmText: '是',
            cancelText: '否',
            hideOnBlur: true,
            onCancel() {
              self.batchReceipts = false;
              self.btnShow = false;
              self.pb = '0'
            },
            onConfirm() {
              self.$router.push({
                path: rootUrl + "/evaluateSub"
              });
            }
          })
        }, e => {
          // console.log(e);
          if (e.repCode == '0104') {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
      },
      //提交
      sureSign() {
        let self = this;
        if (this.isAccept == 0) {
          this.$router.push({
            path: rootUrl + "/agreement",
            query: {
              vin: this.$route.query.vin
            }
          });
          return;
        }
        self.$vux.confirm.show({
          content: '是否登记质损',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel() {
            self.batchReceipts = true;
          },
          onConfirm() {
            let arr = [];
            arr.push(self.pramsData);
            self.$api.ssSet('damageArr', arr);
            self.$router.push({
              path: rootUrl + "/damageList"
            });
            return;
          }
        })
      },
      loadData() {
        let self = this;
        self.$api.post('crm/crmOrder/getShipmentList', {
          operateCode: '107',
          operateName: '/订单中心/详情',
          vin: this.$route.query.vin
        }, r => {
          // console.log(r);
          self.order = r.repData;
        }, e => {
          if (e.repCode == '0104') {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          }
        })
      },
      loadPrams() {
        let self = this;
        self.$api.post('crm/sign/returnVehicleLose', {
          operateCode: '155',
          operateName: '/订单中心/查询参数',
          vin: this.$route.query.vin
        }, r => {
          // console.log(r);
          if (r.repData) {
            self.btnShow = true;
            self.pb = '4em'
            self.pramsData = r.repData;
          }
        }, e => {
          if (e.repCode == '0104') {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else {
            console.log(e);
          }
        })
      },
      // 有质损时 跳转质损详情页
      toDetail(){
        let self=this;
        self.$api.ssSet("detailId", self.order.receiveId);
        self.$router.push({
          path: rootUrl + "/signDetail"
        });
      }
    },
    created() {
      //获取是否签署协议
      let self = this;
      var id = self.$api.ssGet('token');
      id = id.substring(0, id.indexOf('_'))
      self.$api.post('crm/customer/getByPrimaryKey', {
        id: id
      }, r => {
        self.isAccept = r.repData.isAccept ? r.repData.isAccept : 0;
        self.canReceive = r.repData.canReceive;
      }, e => {
        console.log(e);
      })
      this.loadData();
      this.loadPrams();
    }
  }
</script>

<style scoped>
  .no-data {
    font-size: .8em;
    color: #aaa;
    line-height: 2em;
    position: absolute;
    top: 50%;
    margin-top: -1em;
    width: 100%;
    text-align: center;
  }

  .detail-title {
    width: 100%;
    padding: 1em 0;
    font-size: 1em;
    min-height: 3em;
    position: absolute;
    box-shadow: 0px 2px 2px #e2e2e2;
    top: 0;
    left: 0;
    background: #fff;
    z-index: 1;
  }

  .datail-vin {
    font-size: .9em;
    color: #111;
    font-weight: 600;
    margin-bottom: 1em;
    margin-left: 1em;
  }

  .datail-add {
    padding: 0 1em 0 3em;
    line-height: 1.2em;
    font-size: .8em;
    color: #666;
    background: url("../../assets/img/icon_detail_add.png") no-repeat 1em top;
    background-size: 1.4em 1.8em;
  }

  .datail-add > p {
    margin-bottom: .5em;
  }

  .fy-status {
    width: 4.5em;
    height: 2.2em;
    line-height: 2em;
    background: url("../../assets/img/icon_fy2.png") no-repeat;
    background-size: 4.5em 2.2em;
    display: block;
    color: #fff;
    font-size: .8em;
    text-align: center;
    position: absolute;
    right: 1em;
    top: 0em;
  }

  .detail-main {
    padding: 0 .8em 1em;
    /*padding: 0 .8em;*/
  }

  .order-line > span {
    height: 2em;
    line-height: 2em;
    font-size: 1em;
    color: #333333;
    display: inline-block;
    vertical-align: top;
  }

  .detail-li {
    min-height: 3.5em;
    padding-left: 6.5em;
    position: relative;
  }

  .detail-sign {
    width: 1em;
    height: 1em;
    background: url("../../assets/img/icon_off.png") no-repeat center;
    background-size: 1.2em;
    position: absolute;
    top: 1.5em;
    left: 6.05em;
  }

  .detail-li:first-child .detail-sign {
    width: 1em;
    height: 1em;
    background: url("../../assets/img/icon_on.png") no-repeat center;
    background-size: 1em;
    position: absolute;
    top: 1.5em;
    left: 6.05em;
  }

  .detail-li .detail-date {
    width: 7em;
    position: absolute;
    line-height: 1.2em;
    top: 1.5em;
    left: 0;
    font-size: .8em;
    color: #999;
    text-align: center;
  }

  .detail-li:first-child > .detail-ex,
  .detail-li:first-child > .detail-date {
    color: #333;
  }

  .detail-li .detail-ex {
    padding: 1.2em 0 0 1.5em;
    min-height: 3.5em;
    line-height: 1.1em;
    color: #999;
    border-left: 1px solid #e2e2e2;

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
    /*position: absolute;*/
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
    background: #fff;
    border-radius: .5em;
    width: 16.5em;
    padding-left: .5em;
    outline: none;
    -webkit-appearance: none;
  }

  .contact {
    padding: 0 .8em 0;
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
  .detail {
    position: absolute;
    right: 1.3em;
    width: 4em;
    height: 1.8em;
    font-size: 0.9em;
    border: 1px solid #feb755;
    color: #feb755;
    text-align: center;
    line-height: 1.8em;
    border-radius: 0.9em;
    top: 1em;
  }
</style>
