<template>
  <div>
    我的{{type}}
  </div>
</template>
<script>
export default {
  name:"my",
  data(){
    return {
      type:this.$route.query.type
    }
  }
}
</script>
