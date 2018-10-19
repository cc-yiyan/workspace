<template>
  <div class="contentBox">
   <div class="content">
     <div class="contentHead">
       <div class="kefu">
         <!-- <img src='../../common/img/kefu@3x.png'> -->
       </div>
       <div class="xinshou">
         <div class="xinshouText">
            您好，您是遇到下面这些常见问题吗？或者需要点击查看<span style="color: #f98d93"  @click="book">新手指南</span>   
            ～
         </div>
       </div>
     </div>
     
     <div class="contentBody">
       <div class="list"  v-for="(item,index) in helpList" :key="index">
         <div class="listTop" @click="con_show(index)">
          <div class="question">
           <!-- <img  src="../../common/img/icon-Q@3x.png"> -->
          </div>
          <div class="title">{{item.topname}}</div>
            <div class="arrow">
              <!-- <img :class="[item.con_sta?'go':'']" src="../../common/img/icon-xiala@3x.png" > -->
            </div>
          </div>
          <div class="listContent" v-show="item.con_sta">
            <span class="problemList"  v-for="(i,ind) in item.content" :key="ind">{{i.cont}}</span>
          </div>   
        </div>

     </div>
   </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "帮助",
      activeNames: ["1"],
      helpList: [
        {
          topname: "输入VIN码查找不到订单",
          con_sta: false,
          content: [
            {
              cont:
                "1、请检查安吉助手帐号(页面)，以及核对主机厂拷车系统中该小车VIN拷车帐号;"
            },
            { cont: "2、检查VIN码是否有误；" },
            { cont: "3、如以上仍无法解决,请联系客服热线,或在线留言；" }
          ]
        },
        {
          topname: "交接时,发现车辆有质损或附件缺失情况，如何处理？",
          con_sta: false,
          content: [
            {
              cont: "请在电子签收前，进行注明及拍照，电子签收使用说明【链接】"
            }
          ]
        },
        {
          topname: "系统上显示车辆已到，但门店未发现该辆商品车，如何处理？",
          con_sta: false,
          content: [
            {
              cont:
                ' 1、如果车辆状态是"已签收",请查看签收人员,并与店内签收人员沟通。【查看签收人员帐号】；'
            },
            {
              cont:
                " 2、如果车辆状态是“已到达”，请在线留言或与安吉客服联系。【在线留言链接】、【客服联系方式+热线】；"
            }
          ]
        },
        {
          topname: "商品车在某一节点长时间未更新状态,如何处理?",
          con_sta: false,
          content: [
            {
              cont:
                " 1、仓库、站台、码头、待发运状态，根据业务点不同，会有2~7天的拼装时间，请耐心等待，如果更新间隔超长，请通过在线留言或联系客服进行询问；"
            },
            {
              cont:
                "2、在途状态,如果更新时间过长,请通过在线留言或联系客服进行询问；"
            }
          ]
        }
      ]
    };
  },
  created() {},
  methods: {
    book() {
      // this.$router.push({ path: "/handBook" });
      this.$api.jumpLink("handBook");
    },
    con_show(a) {
      this.helpList[a].con_sta = !this.helpList[a].con_sta;
      this.rotate = !this.rotate;
    }
  }
};
</script>

<style scoped>
.contentBox {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: #f7f7f7;
  overflow-y: auto;
}
.content {
  overflow: hidden;
  box-sizing: border-box;
  /* padding: 3% 0; */
  margin: 0 auto;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-flow: column;
  flex-flow: column;
  -moz-display: flex;
  -webkit-display: flex;
  -o-display: flex;
  -o-flex-flow: column;
  height: 100%;
}
.contentHead {
  display: flex;
  padding: 0 1rem;
  height: 11.6rem;
  background-color: #fff;
  /* width: 94%; */
}
.contentBody {
  overflow-y: auto;
  position: relative;
  margin-top: 0.6rem;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -moz-flex: 1;
  -o-flex: 1;
  -webkit-flex: 1;
  background-color: #fff;
}

.kefu {
  margin-top: 2.5rem;
  margin-left: 1.5rem;
}
.kefu img {
  height: 9rem;
  width: 7rem;
}
.xinshou {
  /* display: flex; */
  margin-top: 2.9rem;
  height: 6rem;
  width: 25rem;
  font-size: 1.3rem;
  color: #666;
  /* background-image: url(../../common/img/bg-xinshouzhinan@3x.png); */
  background-size: 100% 100%;
}
.xinshouText {
  line-height: 1.5rem;
  padding: 1.2rem 1.4rem 1.1rem 1.4rem;
}
.list {
  /* overflow: hidden; */
  border-bottom: 1px solid #f2f2f2;
}
.listTop {
  display: flex;
  padding-top: 1.17rem;
  padding-right: 1.67rem;
  padding-bottom: 1.17rem;
  justify-content:  space-between;
}
.question img {
  width: 100%;
  height: 100%;
}
.question {
  height: 1.8rem;
  width: 2rem;
  margin-left: 2rem;
  padding-right: 1.6rem;
}
.title {
  flex: 1;
  /* width: 22.5rem; */
  font-family: PingFangSC-Regular;
  font-size: 14px;
  line-height: 1.6rem;
  color: #696969;
}
.arrow {
  margin-left: 1.92rem;
}
.arrow > img {
  width: 1.2rem;
  height: 0.7rem;
  padding-right: 0.6rem;
}
.go {
  /* transform-origin: 50% 50%; */
  transform: rotateX(180deg);
  transition: all 0s;
}
.listContent {
  padding: 1rem 0;
}
.problemList {
  display: block;
  padding: 0 3rem;
  font-size: 1.3rem;
  color: #999999;
  line-height: 2rem;
}
</style>