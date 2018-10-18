<template>
  <div style="height: 100%;font-size: .32rem;">
    <div class="contact" v-show="list.length!=0">
      <scroller height="" use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore" lock-x
                ref="scrollerBottom">
        <ul style="padding-bottom: .5em;" >
          <li v-for="(item, index) in list" class="contact-li" :key="index" @click="toDetail(item)">
            <p>{{item.title}}</p>
            <span>{{item.createTime.substr(0,10)}}</span>
          </li>
        </ul>
      </scroller>
    </div>
    <div v-show="list.length==0" class="no-data">暂无数据</div>
  </div>
</template>

<script>
  import {Scroller} from 'vux'
  let rootUrl = sessionStorage.getItem('rooturl');
  const pullupDefaultConfig = {
    content: '上拉加载更多',
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '释放后加载',
    upContent: '上拉加载更多',
    loadingContent: '加载中...',
    clsPrefix: 'xs-plugin-pullup-',
  };
  export default {
    name: "",
    components: {
      Scroller
    },
    data() {
      return {
        dealerCode: '',
        pullupDefaultConfig: pullupDefaultConfig,
        pageNum: 1,
        pageRows: 20,
        list: []
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.scrollerBottom.disablePullup();
        this.$refs.scrollerBottom.reset({top: 0})
      })
    },
    methods: {
      loadMore() {
        let self = this;
        let p = {
          operateCode: '101',
          operateName: '/投诉与建议',
          pageNum: self.pageNum,
          pageRows: self.pageRows,
          dealerCode: self.dealerCode
        }
        self.$api.post('crm/comment/queryList', p, r => {
          self.pageNum++;
          // console.log(r);
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset();
          })
          if (self.pageNum > r.repData.pages) {
            this.$refs.scrollerBottom.disablePullup()
          }
          for (var i = 0; i < r.repData.list.length; i++) {
            // this.list = []
            this.list.push(r.repData.list[i]);
          }
          this.$refs.scrollerBottom.donePullup()
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
      toDetail(item) {
        this.$router.push({
          path: rootUrl + "/contactDetail",
          query: {id: item.id}
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
        self.dealerCode = r.repData.dealerCode;
        this.loadMore();
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
  .contact {
    padding: 0 .8em;
  }

  .contact-li {
    padding: 0 .5em;
    height: 3em;
    line-height: 3em;
    border-bottom: 1px solid #e2e2e2;
    position: relative;
    overflow: hidden;
    display: block;
  }

  .contact-li > p {
    font-size: .9em;
    color: #999;
  }

  .contact-li > span {
    position: absolute;
    top: 0;
    right: .8em;
    text-align: right;
    font-size: .8em;
    color: #999;
  }
</style>
