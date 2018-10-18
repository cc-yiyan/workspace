<template>
  <div>
    <search
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
</template>

<script>
  import { Search } from 'vux'
  export default {
    components: {
      Search
    },

  }
</script>
<style scoped>

</style>
