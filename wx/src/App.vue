<template>
  <div id="app">
    <router-view></router-view>
    <!--<router-view v-wechat-title='$route.meta.title'></router-view>-->
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>
<style lang="less">
@import "./common/css/common.css";
</style>
