<template>
  <div style="font-size: 0.32rem;position: relative;" class="order-bg">
    <div style="padding-top: 1em;"></div>
    <div class="view-box">
      <div class="view-vin">{{view.vin}}</div>
      <!--<div v-if="view.orderStatus != null" class="fy-status">{{view.orderStatus}}</div>-->
      <div class="view-ex">
        <p>{{view.cateName}}</p>
        <p v-if="view.callOffRetailerName"><span>经</span>{{view.callOffRetailerName}}</p>
      </div>
    </div>
    <div class="view-box" style="margin-top: 1em;">
      <div class="view-vin">
        <!--<p v-if="view.currentLocation != '' && view.currentLocation != null"><span>最新位置：</span>{{view.currentLocation}}</p>-->
        <p v-if="view.orderStatus != null && view.orderStatus != ''"><span>最后更新状态：</span>{{view.orderStatus}}</p>
        <!--<p v-if="statusShow&&(view.orderStatus == null || view.orderStatus == '')"><span>最后更新状态：</span>待发运</p>-->
        <p v-if="view.otd != null && view.otd != ''"><span>预计到达时间：</span>{{view.otd}}</p>
      </div>
      <div class="view-ex">
        <div class="view-line">
          <div>
            <div class="view-src"></div>
            <p>{{view.orderSrcCName}}</p>
            <span>{{view.orderSrcPName}}</span>
          </div>
          <div class="view-arrow-line"></div>
          <div>
            <div class="view-dest"></div>
            <p>{{view.orderDestCName}}</p>
            <span>{{view.orderDestPName}}</span>
          </div>
        </div>
      </div>
      <div class="view-btn-box">
        <div class="view-btn" @click="toDetail">查看详情</div>
      </div>
    </div>
    <div class="btn-wrap" v-if="btnShow">
      <span class="all-btn" @click="sureSign">确认签收</span>
    </div>
    <!--验证码-->
    <div class="mask" v-show="batchReceipts" @click="batchReceipts = false"></div>
    <div class="code" v-show="batchReceipts">
      <input class="code-input" maxlength="6" type="text" v-model.trim="smsCode">
      <span class="time" @click="getSmsCode">{{smsText}}</span>
      <span v-show="sendAuthCode" class="time" @click="getSmsCode">{{smsText}}</span>
      <span v-show="!sendAuthCode" class="time time-active">{{auth_time}}s</span>
      <div class="code-btn-wrap">
        <span @click="cancel">取消</span>
        <span @click="signIn" style="color: #a3121a;border-left: 1px solid #fafafa;">确定</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { Confirm } from 'vux'
  let rootUrl = sessionStorage.getItem('rooturl');
  export default {
    name: "OrderView",
    components: {
      Confirm
    },
    data() {
      return {
        statusShow: false,
        pramsData: null,
        isAccept: 0,
        canReceive: 0,
        batchReceipts:false,
        smsText: '验证码',
        smsCode:"",//短信验证码
        auth_time: 59,
        codeKey:"",
        sendAuthCode: true,
        btnShow: false,
        view: {}
      }
    },
    methods: {
      getSmsCode(){
        var self=this;
        self.sendAuthCode = false;
        self.auth_time = 59;
        var auth_timetimer =  setInterval(()=>{
          self.auth_time--;
          if(self.auth_time<=0){
            self.smsText="重新获取"
            this.sendAuthCode = true;
            clearInterval(auth_timetimer);
          }
        }, 1000);
        var id = self.$api.ssGet('token');
        id = id.substring(0,id.indexOf('_'))
        self.$api.post("crm/sign/sendSMSCode",{operateCode: '112', operateName: '/签收中心/验证码',id:id},success => {
          self.codeKey=success.repData.codeKey;
        },error => {
          self.$message.error(error.repMsg);
        })
      },
      cancel(){
        var self=this;
        self.smsCode="";
        self.batchReceipts = false;
      },
      //最后提交签收
      signIn(){
        var self=this;
        let arr = [];
        // self.list.forEach((item)=>{
        //   if(item.checked){
        //     arr.push({carNo:item.carNo,isLose:item.isLose,orderId:item.orderId,receiveId:item.receiveId,vin:item.vin})
        //   }
        // })
        arr.push(self.pramsData);
        // 直接评价传递参数
        let evalArr = [];
        arr.forEach((item)=>{
          evalArr.push(item.vin)
        })
        self.$api.ssSet('evalArr',evalArr);
        var p={
          operateCode: '113',
          operateName: '/签收中心/签收提交',
          signIds:arr,
          codeKey:self.codeKey,
          smsCode:self.smsCode
        }
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
        // if(self.codeKey==""){
        //   self.$message.error("请获取正确验证码");
        //   return;
        // }
        self.$api.post("crm/sign/signOrder",p,success => {
          self.$vux.confirm.show({
            content: '是否去评价',
            confirmText: '是',
            cancelText: '否',
            hideOnBlur: true,
            onCancel () {
              self.batchReceipts=false;
              self.btnShow = false;
            },
            onConfirm () {
              self.$router.push({
                path: rootUrl + "/evaluateSub"
              });
            }
          })
        },e => {
          console.log(e);
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
      //提交
      sureSign(){
        let self = this;
        if(this.isAccept == 0){
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
          onCancel () {
            self.batchReceipts = true;
          },
          onConfirm () {
            let arr = [];
            arr.push(self.pramsData);
            self.$api.ssSet('damageArr',arr);
            self.$router.push({
              path: rootUrl + "/damageList"
            });
            return;
          }
        })
      },
      loadData() {
        let self = this;
        self.$api.post('crm/crmOrder/getOrderInfo', {operateCode: '111',operateName: '/订单中心/位置',vin: this.$route.query.vin}, r => {
          // console.log(r);
          self.view = r.repData;
          self.statusShow = true;
        }, e => {
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
      toDetail(){
        this.$router.push({
          path: rootUrl + "/orderDetail",
          query: {
            vin: this.$route.query.vin
          }
        });
      },
      loadPrams() {
        let self = this;
        self.$api.post('crm/sign/returnVehicleLose', {operateCode: '155',operateName: '/订单中心/查询参数',vin: this.$route.query.vin}, r => {
          console.log(r);
          if(r.repData){
            self.btnShow = true;
            self.pramsData = r.repData;
          }
        }, e => {
          if(e.repCode == '0104'){
            sessionStorage.clear();
            self.$api.getId(this.$route);
          }
          else{
            console.log(e);
          }
        })
      }
    },
    created() {
      //获取是否签署协议
      let self = this;
      var id = self.$api.ssGet('token');
      id = id.substring(0,id.indexOf('_'))
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
  .order-bg {
    width: 100%;
    height: 100%;
    background: url("../../assets/img/order_bg.png") no-repeat center;
    background-size: cover;
    position: relative;
  }

  .view-box {
    margin: 0 1em;
    background: #f1f1f1;
    height: auto;
    border-radius: .5em;
    position: relative;
    font-size: .8em;
  }

  .view-box .view-vin {
    /*min-height: 3em;*/
    line-height: 1.5em;
    padding: 1em 1em .8em;
    border-bottom: 1px solid #e2e2e2;
    color: #333;
    font-weight: 600;
  }

  .view-vin p {
    line-height: 1.5em;
    margin-bottom: .5em;
  }

  .view-vin p > span {
    color: #666;
  }

  .view-box {
    min-height: 3em;
    line-height: 1.5em;
    padding: .8em 1em 1em;
    color: #666;
  }

  .view-ex {
    min-height: 3em;
    line-height: 2em;
    padding: .8em 1em 1em;
    color: #666;
  }

  .view-ex p > span {
    width: 1.4em;
    height: 1.4em;
    display: inline-block;
    background: #ffc927;
    line-height: 1.4em;
    text-align: center;
    border-radius: .2em;
    color: #fff;
    margin-right: .5em;
  }

  .view-btn-box {
    border-top: 1px solid #e2e2e2;
    padding: 1.5em;
  }

  .view-btn {
    width: 9em;
    height: 2.5em;
    line-height: 2.5em;
    font-size: .9em;
    text-align: center;
    color: #fff;
    margin: 0 auto;
    background: #ff4d51;
    border-radius: 2em;
  }

  .view-line > div {
    /*height: 2em;*/
    line-height: 1.5em;
    font-size: 1em;
    color: #333333;
    display: inline-block;
    margin: 0 .5em;
    text-align: center;
  }
  .view-line > div > p{
    color: #333;
    line-height: 1.2em;
    font-size: 1.2em;
    font-weight: 600;
  }
  .view-line > div > span{
    color: #666;
    font-size: .9em;
    display: block;
  }

  .view-arrow-line {
    width: 4em;
    height: 2em;
    background: url("../../assets/img/icon_arrow_line.png") repeat-x center;
    background-size: 100% .2em;
  }

  .view-src{
    width: 100%;
    height: 2em;
    background: url("../../assets/img/icon_view_src.png") no-repeat center;
    background-size: 1.6em;
  }
  .view-dest{
    width: 100%;
    height: 2em;
    background: url("../../assets/img/icon_view_desc.png") no-repeat center;
    background-size: 1.6em;
  }
  .fy-status{
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
  /*footer*/
  .btn-wrap {
    position: absolute;
    z-index: 98;
    width: 100%;
    bottom: 0;
    height: 2.5em;
    line-height: 2.5em;
    padding-top: .5em;
    padding-bottom: .5em;
    background: #ffffff;
    border-top: 1px solid #f2f1f1;
    box-shadow: 0 0px 2px #e2e2e2;
  }

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
  .mask{
    width: 100%;
    height: 100%;
    z-index: 99;
    position: fixed;
    opacity: .2;
    left: 0;
    top: 0;
    background: #000000;
  }
  .code{
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
  .code-input{
    position: absolute;
    border:1px solid #eeeeee;
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
  .code .time{
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
  .code .time-active{
    background: #ddd;
  }
  .code .code-btn-wrap{
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0;
    border-top: 1px solid #fafafa;
  }
  .code .code-btn-wrap span{
    display: inline-block;
    width: 49%;
    text-align: center;
    line-height: 3em;

  }
</style>
