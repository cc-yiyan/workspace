<template>
    <div class="help" style="font-size: .32rem;">
      <div class="question">Q：输入VIN码查找不到订单？</div>
      <div class="answer">1、请检查安吉助手帐号（页面），以及核对主机厂拷车系统中该小车VIN拷车帐号;</div>
      <div class="answer">2、检查VIN码是否有误;</div>
      <div class="answer">3、如以上仍无法解决，请联系客服热线，或在线留言;</div>
      <div class="question">Q：交接时，发现车辆有质损或附件缺失情况，如何处理？</div>
      <div class="answer">1、请在电子签收前，进行注明及拍照，电子签收使用说明【链接】;</div>
      <div class="question">Q：系统上显示车辆已到，但门店未发现该辆商品车，如何处理？</div>
      <div class="answer">1、如果车辆状态是"已签收",请查看签收人员,并与店内签收人员沟通。【查看签收人员帐号】;</div>
      <div class="answer">2、如果车辆状态是“已到达”，请在线留言或与安吉客服联系。【在线留言链接】、【客服联系方式+热线】;</div>
      <div class="question">Q：商品车在某一节点长时间未更新状态,如何处理？</div>
      <div class="answer">1、仓库、站台、码头、待发运状态，根据业务点不同，会有2~7天的拼装时间，请耐心等待，如果更新间隔超长，请通过在线留言或联系客服进行询问;</div>
      <div class="answer">2、在途状态,如果更新时间过长,请通过在线留言或联系客服进行询问;</div>
    </div>
</template>

<script>
    export default {
        name: "Help"
    }
</script>

<style scoped>
  .help{
    font-size: 1.2em;
    padding: 0 1em;
    line-height: 1.5em;
    color: #333;
  }
  .question{
    color: darkred;
    margin-top: 1em;
  }
  .answer{
    color: #999;
  }
</style>
