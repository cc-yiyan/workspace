<template>
  <div style="font-size: 0.32rem;">
    <view-box ref="viewBox" body-padding-top="44px" body-padding-bottom="0">
      <div style="position: absolute; top: 0; left: 0; width: 100%;">
        <search style="line-height: 28px;"
                @result-click="resultClick"
                @on-change="getResult"
                :results="results"
                v-model="value"
                @on-focus="onFocus"
                @on-cancel="onCancel"
                @on-submit="onSubmit"
                auto-scroll-to-top
                placeholder="请输入VIN码"
                ref="search">
        </search>
      </div>
      <div class="contact" style="padding-bottom: 0;">
        <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                  ref="scrollerBottom" :height="viewH">
          <ul style="padding-bottom: .5em;">
            <li v-for="(item, index) in list" class="contact-li" :key="index" @click="changeChecked(item)" style="position: relative;">
              <span v-if="item.isReceive == 0" class="check-item" :class="{'check-item-active': item.checked}"></span>
              <p>{{item.vin}}</p>
              <p>{{item.carName}}</p>
              <p v-show="item.isReceive==1">签收人：{{item.receiveUser}}</p>
              <p v-show="item.isReceive==1">签收时间：{{item.receiveTime}}</p>
              <span v-if="item.isReceive == 1&&item.isLose==1" class="detail">详情</span>
            </li>
          </ul>
        </scroller>
      </div>
      <div  class="btn-wrap" v-if="canReceive==1&&hasReceive>0">
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
    <div v-if="noDataShow" class="no-data">暂无数据</div>
  </div>
</template>

<script>
  let rootUrl = sessionStorage.getItem('rooturl');
  import {ViewBox, Search, Scroller} from 'vux'

  const pullupDefaultConfig = {
    content: '上拉加载更多',
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '释放后加载',
    upContent: '上拉加载更多',
    loadingContent: '加载中...',
    clsPrefix: 'xs-plugin-pullup-',
  }
  export default {
    name: "signSearch",
    components: {
      ViewBox,
      Search,
      Scroller
    },
    data() {
      return {
        noDataShow: false,
        isAccept: 0,
        canReceive: 0,
        hasReceive: 0,
        allCheck: false,
        batchReceipts:false,
        smsText: '验证码',
        smsCode:"",//短信验证码
        auth_time: 59,
        codeKey:"",
        sendAuthCode: true,
        results: [],
        value: '',
        pageNum: 1,
        pageRows: 20,
        list: [],
        type: 0,
        status: null,
        pullupDefaultConfig: pullupDefaultConfig,
        viewH: ''
      }
    },
    mounted() {
      this.value = this.$route.query.vin;
      this.status = this.$route.query.status;
      let viewH = this.$route.query.view;
      this.viewH = (viewH - 44) + 'px';
      this.loadMore();
      this.$nextTick(() => {
        this.$refs.scrollerBottom.disablePullup();
        this.$refs.scrollerBottom.reset({top: 0})
      })
    },
    methods: {
      changeChecked(item){
        if(item.isReceive == 0){
          item.checked = !item.checked;
        }else if(item.isReceive == 1){
          this.toDetail(item);
        }
      },
      toDetail(item){
        if(item.isLose){
          this.$api.ssSet('detailId', item.receiveId);
          this.$router.push({
            path: rootUrl + "/signDetail"
          });
        }
      },
      all(){
        this.allCheck = !this.allCheck;
        if(this.allCheck){
          this.list.forEach((item)=>{
            if(item.isReceive == 0){
              item.checked = true;
            }
          })
        }else{
          this.list.forEach((item)=>{
            if(item.isReceive == 0){
              item.checked = false;
            }
          })
        }
      },
      // 获取验证码
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
        self.$api.post("crm/sign/sendSMSCode",{operateCode: '116',operateName: '/签收中心/验证码',id:id},success => {
          self.codeKey=success.repData.codeKey;
        },error => {
          self.$message.error(error.repMsg);
        })
      },
      // 签收
      signIn(){
        var self=this;
        let arr = [];
        self.list.forEach((item)=>{
          if(item.checked){
            arr.push({carName:item.carName,isLose:item.isLose,orderId:item.orderId,receiveId:item.receiveId,vin:item.vin})
          }
        })
        // 直接评价传递参数
        let evalArr = [];
        arr.forEach((item)=>{
          evalArr.push(item.vin)
        })
        self.$api.ssSet('evalArr',evalArr);
        var p={
          operateCode: '113',
          operateName: '/签收中心/提交',
          signIds:arr,
          codeKey:self.codeKey,
          smsCode:self.smsCode
        }
        // console.log(p)
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
          console.log(success);
          self.$vux.confirm.show({
            content: '签收成功请评价',
            confirmText: '是',
            cancelText: '否',
            hideOnBlur: true,
            onCancel () {
              self.batchReceipts=false;
              self.list = [];
              self.pageNum = 1;
              self.loadMore();
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
      cancel(){
        var self=this;
        self.smsCode="";
        self.batchReceipts = false;
      },
      //提交
      sureSign(){
        let self = this;
        let a = false;
        self.list.forEach((item)=>{
          if(item.checked){
            a = true;
          }
        })
        if(!a){
          self.$vux.toast.show({
            text: '请选择一条',
            width: '10em',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
          return;
        }
        if(this.isAccept == 0){
          this.$router.push({
            path: rootUrl + "/agreement"
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
            self.list.forEach((item)=>{
              if(item.checked){
                arr.push(item)
              }
            })
            self.$api.ssSet('damageArr',arr);
            self.$router.push({
              path: rootUrl + "/damageList"
            });
            return;
          }
        })
      },
      setFocus() {
        this.$refs.search.setFocus()
      },
      resultClick(item) {
        window.alert('you click the result item: ' + JSON.stringify(item))
      },
      getResult(val) {
        // console.log('on-change', val);
        // this.results = val ? this.getResult(this.value) : []
      },
      onSubmit() {
        this.$refs.search.setBlur();
        if(this.value.length < 6){
          this.$vux.toast.show({
            text: '请输入VIN码或VIN码后6位',
            time: '2000',
            type: 'text',
            position: 'middle',
          })
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
        this.list = [];
        this.loadMore();
        this.$refs.scrollerBottom.reset({top: 0})
      },
      onFocus() {
        // console.log('on focus')
      },
      onCancel() {
        // console.log('on cancel')
      },
      loadMore() {
        let self = this;
        let p = {
          operateCode: '118',
          operateName: '/签收中心/列表',
          pageNum: self.pageNum,
          pageSize: self.pageRows,
          isReceive: null,
          weChatOrPc: 1,
          vin: self.value || null
        }
        self.$api.post('crm/sign/getCustomerSignOrder', p, r => {
          self.pageNum++;
          // console.log(r);
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          })
          if (self.pageNum > r.repData.page.pages) {
            self.$refs.scrollerBottom.disablePullup();
          }else{
            self.$refs.scrollerBottom.enablePullup()
          }
          let res = r.repData.page.list
          if (res.length == 0){
            self.noDataShow = true;
          }else{
            self.noDataShow = false;
            for (var i = 0; i < res.length; i++) {
              this.list.push({
                checked:false,
                vin:res[i].vin,
                isLose:res[i].isLose,
                isReceive:res[i].isReceive,
                orderId:res[i].orderId,
                receiveId:res[i].receiveId,
                carName:res[i].carName,
                receiveUser:res[i].receiveUser,
                receiveTime:res[i].receiveTime
              });
              if(res[i].isReceive == 0){
                self.hasReceive++;
              }
            }
          }
          this.$refs.scrollerBottom.donePullup()
        }, e => {
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
    }
  }
</script>

<style scoped>
  .no-data{
    font-size: .8em;
    color: #aaa;
    line-height: 2em;
    position: absolute;
    top: 50%;
    margin-top: -1em;
    width: 100%;
    text-align: center;
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
  .code .time{
    display: inline-block;
    background: #ca151e;
    position: absolute;
    top: 2em;
    right: 1.1em;
    border-radius: .5em;
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
  .contact {
    padding: 0 .8em;
  }

  .contact-li {
    padding: 1em .8em 1em 1.8em;
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
  .detail{
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
    top: 2.8em;
  }

  /*footer*/
  .btn-wrap{
    position: fixed;
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
  .all-btn{
    display: inline-block;
    position: absolute;
    top: .5em;
    right: 1.5em;
    width: 6em;
    height: 2.5em;
    line-height: inherit;
    background: #ca151e;
    color: #fff;
    text-align: center;
    border-radius: 1.5em;
  }
  .all-btn span{
    font-size: .8em;
  }
  .all-text{
    display: inline-block;
    margin-left: 3.2em;
    line-height: 2.5em;
    font-size: .9em;
    color: #b9b9b9;
  }
  .check-item{
    position: absolute;
    left: .2em;
    top: 1.5em;
    -webkit-appearance: none;
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: .6em;
    outline: none;
  }
  .check-item-active{
    background: url(../../assets/img/select.png);
    background-size: cover;
    border: none;
  }
  .all-check{
    width: 1.3em;
    height: 1.3em;
    border-radius: .7em;
    left: 1em;
    top: 1.1em;
  }
</style>
