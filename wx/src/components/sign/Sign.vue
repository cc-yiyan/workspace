<template>
  <div style="height: 100%;font-size: .32rem;">
    <!-- <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="0" v-show="custType == 3"> -->
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="0">
      <div>
        <search style="line-height: 28px;"
          @result-click="resultClick"
          @on-change="getResult"
          :results="results"
          v-model="value"
          @on-focus="onFocus"
          @on-cancel="onCancel"
          @on-submit="onSubmit"
          position="absolute"
          auto-scroll-to-top
          top="0"
          placeholder="请输入VIN码查询"
          ref="search">
        </search>
      </div>
      <div class="tabBox">
      <div v-show="listState == 0" class="tabItem">
        <tab :line-width="2" custom-bar-width="5em">
          <!-- 原始代码 -->
          <tab-item selected @on-item-click="onItemClick(0)">待签收</tab-item>
          <tab-item @on-item-click="onItemClick(1)">已签收</tab-item>
          <!-- <tab-item v-if="custType==3"  selected @on-item-click="onItemClick(0)">待签收</tab-item>
          <tab-item v-if="custType!==3" disabled @on-item-click="onItemClick(0)">待签收</tab-item> -->
           <!-- <tab-item v-if="status==0&&canReceive==1"  selected @on-item-click="onItemClick(0)">待签收</tab-item>
          <tab-item  v-if="status==1" @on-item-click="onItemClick(1)">已签收</tab-item> -->
        </tab>
      </div>
      <div v-show="listState == 0" class="riseOrFall" @click="riseFall">
        <img style="width: 18px;height: 18px;padding: 13px 0 0 10px" :src="ascendingOrder==true ? shengxu : jiangxu">
      </div>
      </div>
      <!--默认显示-->
      <div class="contact" v-show="listState == 0" >
        <p class="btnView"  v-if="status==1">
            <x-switch title="仅显示已登记质损订单" v-model="isloss" @on-change="selLossFun"></x-switch>
        </p>

        <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                  ref="scrollerBottom" :height="lishH">
          <ul style="padding-bottom: .5em;" >
            <li v-if="status==0" v-for="(item, index) in list" class="contact-li" :key="index" @click="changeChecked(item)" style="position: relative;">
               <span  class="check-item" :class="{'check-item-active': item.checked}"></span>
              <p>{{item.vin}}</p>
              <p>{{item.carName}}</p>
            </li>
            <li v-if="status==1" v-for="(item, index) in list" class="contact-li" :key="index" @click="toDetail(item)" style="position: relative;">
              <p>{{item.vin}}</p>
              <p class="txtColor">{{item.carName}}</p>
              <p>签收人：{{item.receiveUser}}</p>
              <p>签收时间：{{item.receiveTime}}</p>
              <span class="detail" v-if="item.isLose">详情</span>
            </li>
          </ul>
        </scroller>
      </div>
      <div  class="btn-wrap" v-if="status==0&&canReceive==1">
        <div @click="all" style="width: 6em;">
          <span class="check-item all-check" :class="{'check-item-active': allCheck}"></span>
          <span class="all-text">全选</span>
        </div>
        <div class="all-btn" @click="sureSign"><span>确认签收</span></div>
      </div>
      <!--验证码-->
      <div class="mask" v-show="batchReceipts" @click="batchReceipts = false"></div>
      <div class="code" v-show="batchReceipts">
        <input class="code-input" maxlength="6" type="text" v-model.trim="smsCode">
        <span class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="sendAuthCode" class="time" @click="getSmsCode">{{smsText}}</span>
        <span v-show="!sendAuthCode" class="time time-active">{{auth_time}}s</span>
        <div class="code-btn-wrap"><span @click="cancel">取消</span><span @click="signIn" style="color: #a3121a;border-left: 1px solid #fafafa;">确定</span></div>
      </div>
    </view-box>
    <!-- <div v-if="noDataShow && custType == 3" class="no-data">暂无数据</div> -->
    <!-- <div v-if="custType == 1" class="no-data">非经销商无权查看此页面</div> -->
    <div v-if="noDataShow" class="no-data">暂无数据</div>
  </div>
</template>

<script>
import { ViewBox, Scroller, Search, Tab, TabItem, Confirm, XSwitch } from "vux";
import Vue from 'vue'
import {WechatPlugin} from 'vux'

Vue.use(WechatPlugin)//使用微信插件
let rootUrl = sessionStorage.getItem("rooturl");
const pullupDefaultConfig = {
  content: "上拉加载更多",
  pullUpHeight: 60,
  height: 40,
  autoRefresh: false,
  downContent: "释放后加载",
  upContent: "上拉加载更多",
  loadingContent: "加载中...",
  clsPrefix: "xs-plugin-pullup-"
};
export default {
  name: "Sign",
  components: {
    ViewBox,
    Scroller,
    Search,
    Tab,
    TabItem,
    Confirm,
    XSwitch
  },
  data() {
    return {
      noDataShow: false,
      lishH: "",
      isAccept: 0,
      canReceive: 0, //车辆能否被签收，人员是否有签收权限
      custType: 0, //是否是经销商
      results: [],
      value: "",
      batchReceipts: false,
      smsText: "验证码",
      smsCode: "", //短信验证码
      auth_time: 59,
      codeKey: "",
      sendAuthCode: true,
      pageNum: 1,
      pageRows: 10,
      allCheck: false,
      status: 0, // 已签收未签收状态
      // vin: '',
      list: [],
      listState: 0,
      history: [],
      pullupDefaultConfig: pullupDefaultConfig,
      viewH: "",
      isloss: false,
      orderLatitude:"",//纬度
      orderLongitude:"",//经度
      shengxu:require('../../assets/img/icon-shengxu@2x.png'),
      jiangxu:require('../../assets/img/icon-jiangxu@2x.png'),
      ascendingOrder:false//默认为降序
    };
  },
  mounted() {
    let self = this;
    this.viewH = window.innerHeight;
    this.$nextTick(() => {
      this.$refs.scrollerBottom.disablePullup();
      this.$refs.scrollerBottom.reset({ top: 0 });
    });
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
  },
  methods: {
    riseFall(){
      if(this.ascendingOrder==true){
        this.ascendingOrder=false
      }else if(this.ascendingOrder==false){
        this.ascendingOrder=true
      }
    },
    getSmsCode() {
      var self = this;
      self.sendAuthCode = false;
      self.auth_time = 59;
      var auth_timetimer = setInterval(() => {
        self.auth_time--;
        if (self.auth_time <= 0) {
          self.smsText = "重新获取";
          this.sendAuthCode = true;
          clearInterval(auth_timetimer);
        }
      }, 1000);
      var id = self.$api.ssGet("token");
      id = id.substring(0, id.indexOf("_"));
      self.$api.post(
        "crm/sign/sendSMSCode",
        { operateCode: "112", operateName: "/签收中心/验证码", id: id },
        success => {
          self.codeKey = success.repData.codeKey;
        },
        error => {
          self.$message.error(error.repMsg);
        }
      );
    },
    cancel() {
      var self = this;
      self.smsCode = "";
      self.batchReceipts = false;
    },
    //最后提交签收
    signIn() {
      var self = this;
      if (self.smsCode == "") {
        self.$vux.toast.show({
          text: "请输入验证码",
          width: "10em",
          time: "2000",
          type: "text",
          position: "middle"
        });
        return;
      }
      let arr = [];
      // 微信获取经纬度

      self.list.forEach(item => {
        if (item.checked) {
          arr.push({
            carName: item.carName,
            isLose: item.isLose,
            orderId: item.orderId,
            receiveId: item.receiveId,
            vin: item.vin
          });
        }
      });
      // 直接评价传递参数
      let evalArr = [];
      arr.forEach(item => {
        evalArr.push(item.vin);
      });
      self.$api.ssSet("evalArr", evalArr);
      var p = {
        operateCode: "113",
        operateName: "/签收中心/签收提交",
        signIds: arr,
        codeKey: self.codeKey,
        smsCode: self.smsCode,
        orderLatitude:self.orderLatitude,
        orderLongitude:self.orderLongitude,
        signFrom:3//签收来源 1:pc端 2:app 3:微信', （传数字）
      };

      // if(self.codeKey==""){
      //   self.$message.error("请获取正确验证码");
      //   return;
      // }
      self.$api.post(
        "crm/sign/signOrder",
        p,
        success => {
          self.$vux.confirm.show({
            content: "是否去评价",
            confirmText: "是",
            cancelText: "否",
            hideOnBlur: true,
            onCancel() {
              self.batchReceipts = false;
              self.list = [];
              self.pageNum = 1;
              self.loadMore();
            },
            onConfirm() {
              self.$router.push({
                path: rootUrl + "/evaluateSub"
              });
            }
          });
        },
        e => {
          console.log(e);
          if (e.repCode == "0104") {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          } else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: "2000",
              type: "text",
              position: "middle"
            });
          }
        }
      );
    },
    changeChecked(item) {
      item.checked = !item.checked;
    },
    all() {
      this.allCheck = !this.allCheck;
      if (this.allCheck) {
        this.list.forEach(item => {
          item.checked = true;
        });
      } else {
        this.list.forEach(item => {
          item.checked = false;
        });
      }
    },
    getLocation(){
      let self = this;
      // 调用微信api获取坐标
      Vue.wechat.getLocation({
        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: function (res) {

          self.orderLatitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
          self.orderLongitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
          // var speed = res.speed; // 速度，以米/每秒计
          // var accuracy = res.accuracy; // 位置精度
        }
      });
    },
    //提交
    sureSign() {
      let self = this;
      let a = false;
      self.list.forEach(item => {
        if (item.checked) {
          a = true;
        }
      });
      if (!a) {
        self.$vux.toast.show({
          text: "请选择一条",
          width: "10em",
          time: "2000",
          type: "text",
          position: "middle"
        });
        return;
      }
      // isAccept    0 是未签署   1是已签署
      if (this.isAccept == 0) {
        this.$router.push({
          path: rootUrl + "/agreement"
        });
        return;
      }
      self.getLocation();
      self.$vux.confirm.show({
        content: "是否登记质损",
        confirmText: "是",
        cancelText: "否",
        hideOnBlur: true,
        onCancel() {
          self.batchReceipts = true;
        },
        onConfirm() {
          let arr = [];
          self.list.forEach(item => {
            if (item.checked) {
              arr.push(item);
            }
          });
          self.$api.ssSet("damageArr", arr);
          self.$router.push({
            path: rootUrl + "/damageList"
          });
          return;
        }
      });
    },
    setFocus() {
      this.$refs.search.setFocus();
    },
    resultClick(item) {
      // window.alert('you click the result item: ' + JSON.stringify(item))
    },
    getResult(val) {
      // console.log('on-change', val);
      // this.results = val ? this.getResult(this.value) : []
    },
    //搜索框提交
    onSubmit() {
      this.$refs.search.setBlur();
      if (this.value.length < 6) {
        this.$vux.toast.show({
          text: "请输入VIN码或VIN码后6位",
          time: "2000",
          type: "text",
          position: "middle"
        });
        return;
      }
      // if(this.value.length != 17){
      //   this.$vux.toast.show({
      //     text: '请输入17位VIN码',
      //     time: '2000',
      //     type: 'text',
      //     position: 'middle',
      //   })
      //   return;
      // }
      this.$api.ssSet("searchText", this.value);
      this.$router.push({
        path: rootUrl + "/signSearch",
        query: {
          vin: this.value,
          view: this.viewH,
          status: this.status
        }
      });
    },
    onFocus() {
      this.listState = 1;
      // console.log(1);
      // this.value = this.$api.ssGet('searchText');
    },
    onCancel() {
      this.listState = 0;
    },
    onItemClick(n) {
      if (n == 0) {
        if (this.canReceive == "0") {
          this.lishH = this.viewH - 90 + "px";
        } else {
          this.lishH = this.viewH - 145 + "px";
        }
      } else {
        this.lishH = this.viewH - 155 + "px";
      }
      this.pageNum = 1;
      this.list = [];
      this.status = n;
      this.$nextTick(() => {
        this.$refs.scrollerBottom.disablePullup();
        this.$refs.scrollerBottom.reset({ top: 0 });
      });
      this.loadMore();
    },
    loadMore() {
      let self = this;
      let isLoss = "-1";
      if (self.isloss && self.status == 1) {
        isLoss = 1;
      }
      let p = {
        operateCode: "114",
        operateName: "/签收中心/列表",
        pageNum: self.pageNum,
        pageSize: self.pageRows,
        isReceive: self.status,
        weChatOrPc: 1,
        vin: self.value,
        // isLose  是否质损
        isLose: isLoss
      };
      self.$api.post(
        "crm/sign/getCustomerSignOrder",
        p,
        r => {
          self.pageNum++;
          // console.log(r);
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          });
          if (self.pageNum > r.repData.page.pages) {
            self.$refs.scrollerBottom.disablePullup();
          } else {
            self.$refs.scrollerBottom.enablePullup();
          }
          let res = r.repData.page.list;
          if (res.length == 0) {
            self.noDataShow = true;
          } else {
            self.noDataShow = false;
            for (var i = 0; i < res.length; i++) {
              this.list.push({
                checked: false,
                vin: res[i].vin,
                isLose: res[i].isLose,
                orderId: res[i].orderId,
                receiveId: res[i].receiveId,
                carName: res[i].carName,
                receiveTime: res[i].receiveTime,
                receiveUser: res[i].receiveUser
              });
            }
          }
          this.$refs.scrollerBottom.donePullup();
        },
        e => {
          console.log(e);
          if (e.repCode == "0104") {
            sessionStorage.clear();
            self.$api.getId(this.$route);
          } else {
            self.$vux.toast.show({
              text: e.repMsg,
              time: "2000",
              type: "text",
              position: "middle"
            });
          }
        }
      );

    },
    toDetail(item) {
      if (item.isLose) {
        this.$api.ssSet("detailId", item.receiveId);
        this.$router.push({
          path: rootUrl + "/signDetail"
        });
      }
    },
    //  质损开关
    selLossFun() {
      let self = this;
      self.$refs.scrollerBottom.reset({ top: 0 });
      self.pageNum = 1;
      self.list = [];
      self.loadMore();
    }
  },
  created() {
    //获取是否签署协议
    let self = this;
    var id = self.$api.ssGet("token");
    id = id.substring(0, id.indexOf("_"));
    self.$api.post(
      "crm/customer/getByPrimaryKey",
      {
        id: id
      },
      r => {
        self.isAccept = r.repData.isAccept ? r.repData.isAccept : 0;
        self.canReceive = r.repData.canReceive;
        if (this.canReceive == 0) {
          this.lishH = this.viewH - 90 + "px";
        } else {
          this.lishH = this.viewH - 145 + "px";
        }
        if (r.repData.custType == 3) {
          self.custType = 3;
          //经销商默认选中未签收
          // self.status = 0;
          self.loadMore();
        } else {
          self.custType = 1;
          //非经销商默认选中已签收
          // self.status = 1;
        }
      },
      e => {
        console.log(e);
      }
    );
  }
};
</script>

<style scoped>
.no-data {
  font-size: 0.8em;
  color: #aaa;
  line-height: 2em;
  position: absolute;
  top: 50%;
  margin-top: -1em;
  width: 100%;
  text-align: center;
}
.mask {
  width: 100%;
  height: 100%;
  z-index: 99;
  position: fixed;
  opacity: 0.2;
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
  border-radius: 0.5em;
  width: 16.5em;
  padding-left: 0.5em;
  outline: none;
  -webkit-appearance: none;
}
.contact {
  padding: 0 0.8em 0;
}
.code .time {
  display: inline-block;
  background: #ca151e;
  position: absolute;
  top: 2em;
  right: 1.1em;
  border-radius: 0 0.5em 0.5em 0;
  font-size: 0.8em;
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
.contact-li {
  padding: 0.8em 0.8em 0.8em 1.8em;
  line-height: 1.2em;
  border-bottom: 1px solid #e2e2e2;
  position: relative;
  overflow: hidden;
  display: block;
}

.contact-li > p {
  font-size: 0.8em;

  color: #666666;
  letter-spacing: -0.36px;
  line-height: 23px;
}
.contact-li > .txtColor {
  color: #999;
}
.detail {
  position: absolute;
  right: 1em;
  width: 4em;
  height: 1.8em;
  font-size: 0.9em;
  border: 1px solid #feb755;
  color: #feb755;
  text-align: center;
  line-height: 1.8em;
  border-radius: 0.9em;
  top: 2.8em;
}
/*footer*/
.btn-wrap {
  position: fixed;
  z-index: 98;
  width: 100%;
  bottom: 0;
  height: 2.5em;
  line-height: 2.5em;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  background: #ffffff;
  border-top: 1px solid #f2f1f1;
  box-shadow: 0 0px 2px #e2e2e2;
}
.all-btn {
  display: inline-block;
  position: absolute;
  top: 0.5em;
  right: 1.5em;
  width: 6em;
  height: 2.5em;
  line-height: inherit;
  background: #ca151e;
  color: #fff;
  text-align: center;
  border-radius: 1.5em;
}
.all-btn span {
  font-size: 0.9em;
}
.all-text {
  display: inline-block;
  margin-left: 3.2em;
  line-height: 2.5em;
  font-size: 0.9em;
  color: #b9b9b9;
}
.check-item {
  position: absolute;
  left: 0.2em;
  top: 1.5em;
  -webkit-appearance: none;
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0.6em;
  outline: none;
}
.check-item-active {
  background: url(../../assets/img/select.png);
  background-size: cover;
  border: none;
}
.all-check {
  width: 1.3em;
  height: 1.3em;
  border-radius: 0.7em;
  left: 1em;
  top: 1.1em;
}
.btnView {
  border-bottom: 1px solid #e2e2e2;
  padding: 0.5em 0.8em 0.5em 0.8em;
}
</style>
<style>
.contact .weui-cell__bd {
  font-family: PingFangSC-Regular;
  color: #999;
  font-size: 0.8em;
}
.tabBox{
  width: 100%;
  position: relative;
}
.tabItem{
  width: 90%;
}
.riseOrFall{
  position: absolute;
  right: 0px;
  width: 10%;
  height: 43px;
  top: 0px;
  border-bottom: 1px solid #e5e5e5;
}
</style>
