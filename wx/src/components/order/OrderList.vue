<template>
  <div style="height: 100%;font-size: .32rem;">
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
          placeholder="请输入VIN码"
          ref="search">
        </search>
      </div>
      <div class="tabBox">
        <div class="tabItem">
          <tab :line-width="2" custom-bar-width="5em">
            <tab-item selected @on-item-click="onItemClick(0)">待发运</tab-item>
            <tab-item @on-item-click="onItemClick(1)">已发运</tab-item>
            <tab-item @on-item-click="onItemClick(2)">已签收</tab-item>
          </tab>
        </div>
        <div class="riseOrFall" @click="riseFall">
          <img style="width: 18px;height: 18px;padding: 13px 0 0 10px" :src="ascendingOrder==true ? shengxu : jiangxu">
        </div>
      </div>
      <div class="contact" v-show="listState == 0">
        <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                  ref="scrollerBottom" :height="viewH">
          <ul style="padding-bottom: .5em;">
            <li v-for="(item, index) in list" class="contact-li" :key="index" @click="toView(item)">
              <p>{{item.vin}}</p>
              <p>{{item.cateName}}</p>
              <!-- 已签收列表新增签收人和签收时间 -->
              <p v-if="status == '2'">签收人：{{item.receiveUser}}</p>
              <p v-if="status == '2'">签收时间：{{item.receiveTime}}</p>
            </li>
          </ul>
        </scroller>
      </div>
      <div class="contact" v-show="listState == 1">
        <div style="font-size: .8em; color: #999; padding: 1em;border-bottom: 1px solid #e2e2e2;">搜索记录</div>
        <div class="history-li" v-for="item in history" v-if="history != ''" @click="historyClick(item)">
          <p>{{item.vin}}</p>
        </div>
        <div class="history-null" v-if="history == ''">暂无记录</div>
      </div>
    </view-box>
    <div v-if="noDataShow && listState == 0" class="no-data">暂无数据</div>
  </div>
</template>

<script>
import { ViewBox, Scroller, Search, Tab, TabItem } from "vux";

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
  name: "OrderList",
  components: {
    ViewBox,
    Scroller,
    Search,
    Tab,
    TabItem
  },
  data() {
    return {
      noDataShow: false,
      results: [],
      value: "",
      pageNum: 1,
      pageRows: 20,
      status: 0, // 待发运已签收未签收状态
      vin: "",
      list: [],
      listState: 0,
      history: [],
      pullupDefaultConfig: pullupDefaultConfig,
      viewH: "",
      shengxu:require('../../assets/img/icon-shengxu@2x.png'),
      jiangxu:require('../../assets/img/icon-jiangxu@2x.png'),
      ascendingOrder:false//默认为降序
    };
  },
  mounted() {
    this.viewH = window.innerHeight - 90 + "px";
    this.$nextTick(() => {
      this.$refs.scrollerBottom.disablePullup();
      this.$refs.scrollerBottom.reset({ top: 0 });
    });
  },
  methods: {
    riseFall(){
      if(this.ascendingOrder==true){
        this.ascendingOrder=false
      }else if(this.ascendingOrder==false){
        this.ascendingOrder=true
      }
    },
    setFocus() {
      this.$refs.search.setFocus();
    },
    resultClick(item) {
      window.alert("you click the result item: " + JSON.stringify(item));
    },
    getResult(val) {
      // console.log('on-change', val);
      // this.results = val ? this.getResult(this.value) : []
    },
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
      this.$router.push({
        path: rootUrl + "/orderSearch",
        query: {
          vin: this.value,
          view: this.viewH
        }
      });
    },
    onFocus() {
      this.listState = 1;
      // console.log('on focus')
    },
    onCancel() {
      this.listState = 0;
      // console.log('on cancel')
    },
    onItemClick(n) {
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
      let p = {
        operateCode: "108",
        operateName: "/订单中心/列表",
        pageNum: self.pageNum,
        pageRows: self.pageRows,
        vin: self.vin,
        status: self.status
      };
      self.$api.post(
        "crm/crmOrder/getOrderListByRetailerCode",
        p,
        r => {
          self.pageNum++;
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          });
          if (self.pageNum > r.repData.pages) {
            this.$refs.scrollerBottom.disablePullup();
          } else {
            this.$refs.scrollerBottom.enablePullup();
          }
          if (r.repData.list.length == 0) {
            self.noDataShow = true;
          } else {
            self.noDataShow = false;
            for (var i = 0; i < r.repData.list.length; i++) {
              this.list.push(r.repData.list[i]);
            }
          }
          // console.log(this.list);
          this.$refs.scrollerBottom.donePullup();
        },
        e => {
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
    historyClick(item) {
      this.value = item.vin;
      this.onSubmit();
    },
    historyList() {
      let self = this;
      self.$api.post(
        "crm/queryUserLog/queryLog",
        { pageNum: 0, pageRows: 10, wechatOrPc: 1 },
        r => {
          // console.log(r);
          // let arr = [];
          // r.repData.list.forEach((item)=>{
          //   if(item.vin){
          //     arr.push(item)
          //   }
          // })
          // self.history = arr.slice(-5);
          self.history = r.repData.list;
        },
        e => {
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
    toView(item) {
      this.$router.push({
        path: rootUrl + "/orderView",
        query: {
          vin: item.vin
        }
      });
    }
  },
  created() {
    this.loadMore();
    this.historyList();
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
.contact {
  padding: 0 0.8em;
}

.contact-li {
  padding: 1em 0.8em;
  line-height: 1.2em;
  border-bottom: 1px solid #e2e2e2;
  position: relative;
  overflow: hidden;
  display: block;
}

.contact-li > p {
  font-size: 0.8em;
  color: #999;
}

.history-li {
  padding: 0 0.5em;
  height: 3em;
  line-height: 3em;
  border-bottom: 1px solid #e2e2e2;
  position: relative;
  overflow: hidden;
  display: block;
}

.history-li > p {
  font-size: 0.9em;
  color: #999;
}

.history-null {
  width: 100%;
  height: 5em;
  line-height: 5em;
  font-size: 0.8em;
  text-align: center;
  color: #999;
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
