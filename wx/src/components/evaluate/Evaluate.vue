<template>
  <div style="height: 100%;font-size: .32rem;">
    <view-box ref="viewBox" body-padding-top="0" body-padding-bottom="0" v-show="custType == 3">
      <div >
        <tab :line-width="2" custom-bar-width="5em" >
          <tab-item selected @on-item-click="onItemClick(0)">未评价</tab-item>
          <tab-item @on-item-click="onItemClick(1)">已评价</tab-item>
        </tab>
      </div>
      <div class="evaluate">
        <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                  ref="scrollerBottom" :height="viewH">
          <ul style="padding-bottom: .5em;">
            <li v-if="navIndex === 0" v-for="(item, index) in list" class="evaluateN-item" :key="index">
              <span class="evaluateN-text">{{item.vin}}</span>
              <div style="width: 10em;color: #727272;margin-left: 11em;height: 2em;line-height: 2em;padding-bottom: .8em;">
                <span @click="evaluate(item, 1)" style="margin-right: .4rem;"><i v-if="item.level===null|| item.level === 0" class="icon icon-good"></i><i v-if="item.level===1" class="icon icon-good-active"></i>好评</span>
                <span @click="evaluate(item, 0)"><i v-if="item.level===null || item.level === 1" class="icon icon-bad"></i><i v-if="item.level===0" class="icon icon-bad-active"></i>差评</span>
              </div>
              <!--<div class="placehod" v-show="item.level === 0">-->
                <!--<group>-->
                  <!--<x-textarea :height=90 :max="100" placeholder="您对此次订单有什么不满意的吗？请告诉我们吧～" v-model="item.feedback"></x-textarea>-->
                <!--</group>-->
              <!--</div>-->
              <div class="placehod" v-show="item.level === 0">
                <textarea @touchmove.stop="touchMove" @touchend="touchEnd" name="" id="" placeholder="您对此次订单有什么不满意的吗？请告诉我们吧～" v-model="item.feedback"></textarea>
              </div>
            </li>
            <li v-if="navIndex === 1" v-for="(item, index) in list" class="evaluateY-item" :key="index">
              <span class="evaluateY-text">{{item.vin}}</span>
              <span v-if="item.level===1" style="font-size: .7em;"><i  class="icon icon-good-active"></i>好评</span>
              <span v-if="item.level===0" style="font-size: .7em;"><i  class="icon icon-bad-active"></i>差评</span>
              <!--<div class="placehods" v-show="item.level===0">-->
                <!--<group>-->
                  <!--<x-textarea :height=90 disabled :show-counter=false :max="100" placeholder="您对此次订单有什么不满意的吗？请告诉我们吧～" v-model="item.feedback"></x-textarea>-->
                <!--</group>-->
              <!--</div>-->
              <div class="placehodEvaluation" v-show="item.level === 0">
                <div>{{item.feedback}}</div>
                <!--<textarea disabled @touchmove.stop="touchMoves" @touchend="touchEnds"  name="" placeholder="您对此次订单有什么不满意的吗？请告诉我们吧～" v-model="item.feedback"></textarea>-->
              </div>
            </li>

          </ul>
        </scroller>
      </div>
      <div v-if="navIndex==0"  class="btn-wrap"><span class="evaluate-btn" @click="sure">提交</span></div>
    </view-box>
    <div v-if="noDataShow && custType == 3" class="no-data">暂无数据</div>
    <div v-if="custType == 1" class="no-data">非经销商无权查看此页面</div>
  </div>
</template>

<script>
  import {XTextarea, Group, ViewBox, Scroller, Tab, TabItem} from 'vux'
  let rootUrl = sessionStorage.getItem('rooturl');
  const pullupDefaultConfig = {
    content: '上拉加载更多',
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '释放后加载',
    upContent: '上拉加载更多',
    loadingContent: '加载中...',
    clsPrefix: 'xs-plugin-pullup-'
  };
  export default {
    name: "Evaluate",
    components: {
      XTextarea,
      Group,
      ViewBox,
      Scroller,
      Tab,
      TabItem
    },
    data() {
      return {
        noDataShow: false,
        pullupDefaultConfig: pullupDefaultConfig,
        custType: 0, //是否是经销商
        navIndex: 0,
        pageNum: 1,
        pageRows: 20,
        dealerCode: null,
        list: [],
        baseH:'',
        viewH:'',
      }
    },
    watch:{
    },
    mounted() {
      this.baseH = window.innerHeight;
      this.viewH = (this.baseH - 95) + 'px';
      this.$nextTick(() => {
        this.$refs.scrollerBottom.disablePullup();
        this.$refs.scrollerBottom.reset({top: 0})
      })
    },
    methods: {
      touchMove(e){
        e.stopPropagation()
      },
      touchMoves(e){
        e.stopPropagation()
      },
      touchEnd(e){
        e.stopPropagation()
      },
      touchEnds(e){
        e.stopPropagation()
      },
      loadMore() {
        let self = this;
        let p = {
          operateCode: '105',
          operateName: '/评价中心/列表',
          pageNum: self.pageNum,
          pageSize: self.pageRows,
          comment: self.navIndex
        }
        self.$api.post('crm/sign/getReceiveOrder', p, r => {
          self.pageNum++;
          self.dealerCode = r.repData.dealerCode;
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          })
          if (self.pageNum > r.repData.selectRemarkOrders.pages) {
            this.$refs.scrollerBottom.disablePullup()
          }else{
            self.$refs.scrollerBottom.enablePullup()
          }
          if (r.repData.selectRemarkOrders.list.length == 0){
            self.noDataShow = true;
          }else{
            self.noDataShow = false;
            for (var i = 0; i < r.repData.selectRemarkOrders.list.length; i++) {

              self.list.push(r.repData.selectRemarkOrders.list[i]);
              // self.list[i].textValue;
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
      },
      evaluate(item, val){
        if(val===1){
          item.level = 1;
          item.feedback="";
        }else{
          item.level = 0;
        }
      },
      // tab切换
      onItemClick(index) {
        if(index==1){
          this.viewH = (this.baseH -48) + 'px';
        }else{
          this.viewH = (this.baseH -95) + 'px';
        }
        this.navIndex = index;
        this.list = [];
        this.pageNum = 1;
        this.$nextTick(() => {
          this.$refs.scrollerBottom.disablePullup();
          this.$refs.scrollerBottom.reset({top: 0})
        })
        this.loadMore();
      },
      // 提交
      sure() {
        let self = this;
        let arr = [];
        self.list.forEach((item=>{
          if(item.level!=null)
          arr.push({'level':item.level,'orderid':item.orderId,'vin':item.vin,'feedback':item.feedback})
        }))
        if(arr.length<1){
            self.$vux.toast.show({
              text: '请评价订单',
              width: '10em',
              time: '2000',
              type: 'text',
              position: 'middle',
            })
          return;
        }
        for(var i=0;i<arr.length;i++){
          if(arr[i].level==0){
            console.log(arr[i])
            if(arr[i].feedback==undefined || arr[i].feedback==""){
              self.$vux.toast.show({
                text: '请填写差评原因',
                width: '10em',
                time: '2000',
                type: 'text',
                position: 'middle',
              })
              return;
            }
          }
        }
        self.$vux.confirm.show({
          content: '请确认评价',
          confirmText: '是',
          cancelText: '否',
          hideOnBlur: true,
          onCancel () {
          },
          onConfirm () {
            let p = {
              operateCode: '106',
              operateName: '/评价中心/提交',
              dealerCode: self.dealerCode,
              orderRemarks: arr,
              type:self.list[0].type
            }
            console.log(p)
            // console.log(p)
            self.$api.post('crm/orderRemark/remark', p, r => {
              // console.log(r);
              self.$vux.toast.show({
                text: '评价成功',
                width: '10em',
                time: '2000',
                type: 'text',
                position: 'middle',
              })
              self.list = [];
              self.pageNum = 1;
              self.loadMore();
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
          }
        })

      }
    },
    created() {
      let self = this;
      var id = self.$api.ssGet('token');
      id = id.substring(0,id.indexOf('_'))
      self.$api.post('crm/customer/getByPrimaryKey', {
        id: id
      }, r => {
        if(r.repData.custType == 3){
          self.custType = 3;
          self.loadMore();
        }else{
          self.custType = 1;
        }
      }, e => {
        console.log(e);
      })
    }
  }
</script>

<style scoped>
  /*.evaluate{*/
    /*padding: 0;*/
  /*}*/
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
  .evaluateN-item{
    width: 90%;
    margin-left: 5%;
    border-bottom: 1px solid #e2e2e2;
    padding-bottom: 16px;
  }
  .evaluateN-text{
    display: inline-block;
    color: #727272;
    margin-left: 1em;
    height: 2.8em;
    line-height: 2.8em;
  }
  .evaluateY-item{
    width: 90%;
    margin-left: 5%;
    border-bottom: 1px solid #e2e2e2;
    padding-bottom: 16px;
  }
  .evaluateY-text{
    display: inline-block;
    color: #727272;
    font-size: .9em;
    margin-left: 1em;
    width: 18em;
    height: 3em;
    line-height: 3em;
  }
  .btn-wrap{
    position: fixed;
    z-index: 999;
    width: 100%;
    bottom: 0;
    height: 2.5em;
    line-height: 2.5em;
    padding-top: .5em;
    padding-bottom: .5em;
    background: #ffffff;
    border-top: 1px solid #f2f1f1;
    text-align: center;
    box-shadow: 0 -3px 2px #fafaf9;
  }
  .evaluate-btn{
    display: inline-block;
    width: 7em;
    height: 100%;
    line-height: inherit;
    font-size: .9em;
    background: #ca151e;
    color: #fff;
    border-radius: 1.3rem;
  }
  .icon{
    width: .6rem;
    height: .6rem;
    font-size: .7em;
    display: inline-block;
    position: relative;
  }
  .icon-good {
    background: url("./../../assets/img/icon-haoping2@2x.png") no-repeat center;
    background-size: 1.4em;
    top: .15rem;
  }
  .icon-bad {
    background: url("./../../assets/img/icon-chaping2@2x.png") no-repeat center;
    background-size: 1.5em;
    top: .2rem;
  }
  .icon-good-active {
    background: url("./../../assets/img/icon-haoping@2x.png") no-repeat center;
    background-size: 1.4em;
    top: .15rem;
  }
  .icon-bad-active {
    background: url("./../../assets/img/icon-chaping@2x.png") no-repeat center;
    background-size: 1.5em;
    top: .2rem;
  }
  /*新增样式*/
  .placehod{
    width: 100%;
  }
  .placehod textarea{
    width: 93%;
    outline: none;
    /*border: none;*/
    height: 90px;
    border: 1px solid #DBDBDB;
    border-radius: 10px;
    resize:none;
    padding: 10px 10px;
    font-size: 13px;
    color: #727272;
  }
  .placehod textarea::-webkit-input-placeholder{
    color:#A8A8A8 !important;
  }
  .placehod textarea:-moz-placeholder{
    color:#A8A8A8 !important;
  }
  .placehod textarea::-moz-placeholder{
    color:#A8A8A8 !important;
  }
  .placehod textarea:-ms-input-placeholder{
    color:#A8A8A8 !important;
  }
  .placehodEvaluation{
    width: 100%;
    /*padding-bottom: 16px;*/
    min-height: 90px;
    background-color: #F7F7F7;
    border-radius: 8px;
  }
  .placehodEvaluation div{
    width: 92%;
    margin-left: 4%;
    padding: 10px 0px;
    font-size: 13px;
    color: #A8A8A8;
    line-height: 18px;
  }
  /*.placehodEvaluation textarea{*/
    /*width: 93%;*/
    /*height: 90px;*/
    /*border: 0px solid #F7F7F7;*/
    /*border-radius: 10px;*/
    /*background-color: #F7F7F7;*/
    /*resize:none;*/
    /*padding: 10px 10px;*/
    /*font-size: 13px;*/
    /*color: #A8A8A8;*/
  /*}*/
</style>
