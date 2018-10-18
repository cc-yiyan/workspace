<template>
  <div>
    <view-box ref="viewBox" body-padding-top="44px" body-padding-bottom="0">
      <div style="position: absolute; top: 0; left: 0; width: 100%;">
        <search style="line-height: 28px;"
                @result-click="resultClick"
                @on-change="getResult"
                v-model="value"
                @on-focus="onFocus"
                @on-cancel="onCancel"
                @on-submit="onSubmit"
                auto-scroll-to-top
                placeholder="请输入VIN码"
                ref="search">
        </search>
      </div>
      <div class="contact">
        <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                  ref="scrollerBottom" :height="viewH">
          <ul style="padding-bottom: .5em;">
            <li v-for="(item, index) in list" class="contact-li" :key="index" @click="toView(item)">
              <p>{{item.vin}}</p>
              <p>{{item.cateName}}</p>
              <p v-if="item.isReceive==1">签收人：{{item.receiveUser}}</p>
              <p v-if="item.isReceive==1">签收时间：{{item.receiveTime}}</p>
              <!--<span v-if="item.orderStatus == '待发运'" class="fy-status1">待发运</span>-->
              <!--<span v-if="item.orderStatus != '待发运'" class="fy-status2">已发运</span>-->
            </li>
          </ul>
        </scroller>
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
    name: "OrderSearch",
    components: {
      ViewBox,
      Search,
      Scroller
    },
    data() {
      return {
        viewH: '',
        noDataShow: false,
        results: [],
        value: '',
        pageNum: 1,
        pageRows: 20,
        vin: '',
        list: [],
        type: 0,
        pullupDefaultConfig: pullupDefaultConfig,
      }
    },
    mounted() {
      let viewH = this.$route.query.view;
      this.viewH = (viewH - 44) + 'px';
      this.vin = this.$route.query.vin;
      this.$nextTick(() => {
        this.$refs.search.setBlur()
        this.$refs.scrollerBottom.disablePullup();
        this.$refs.scrollerBottom.reset({top: 0})
      })
    },
    methods: {
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
        this.pageNum = 1;
        this.pageRows = 20;
        this.$refs.search.setBlur();
        this.type = 1;
        this.list = [];
        this.loadMore();
        this.$refs.scrollerBottom.reset({top: 0});
        this.$refs.scrollerBottom.disablePullup();
      },
      onFocus() {
        // this.listState = 1;
        // console.log('on focus')
      },
      onCancel() {
        // this.listState = 0;
        // console.log('on cancel')
      },
      loadMore() {
        if (this.type == 0) {
          this.vin = this.$route.query.vin;
          this.value = this.vin;
        }
        else {
          this.vin = this.value
        }
        let self = this;
        let p = {
          operateCode: '110',
          operateName: '/订单中心/搜索',
          pageNum: self.pageNum,
          pageRows: self.pageRows,
          vin: self.vin,
          status: -1
        }
        self.$api.post('crm/crmOrder/getOrderListByRetailerCode', p, r => {
          self.pageNum++;
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          })
          if (self.pageNum > r.repData.pages) {
            this.$refs.scrollerBottom.disablePullup()
          }
          else {
            this.$refs.scrollerBottom.enablePullup();
          }
          let res = r.repData.list;
          if (res.length == 0){
            self.noDataShow = true;
          }else{
            self.noDataShow = false;
            for (var i = 0; i < res.length; i++) {
              this.list.push(res[i]);
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

  .fy-status1 {
    width: 4.5em;
    height: 2.2em;
    line-height: 2em;
    background: url("../../assets/img/icon_fy1.png") no-repeat;
    background-size: 4.5em 2.2em;
    display: block;
    color: #fff;
    font-size: .8em;
    text-align: center;
    position: absolute;
    right: 1em;
    top: 1.5em;
  }

  .fy-status2 {
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
    top: 1.5em;
  }
</style>
