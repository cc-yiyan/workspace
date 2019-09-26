<template>
  <div id="app-box" style="height:100%">
    <router-view></router-view>
    <!--<router-view v-wechat-title='$route.meta.title'></router-view>-->
  </div>
</template>

<script>
export default {
  name: 'app-box'
}
</script>
<style lang="less">
@import "./common/css/common.css";
</style>
