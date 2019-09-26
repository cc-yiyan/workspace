<template>
  <div>
    我的{{id}}
  </div>
</template>
<script>
export default {
  name:"my",
  data(){
    return {
      id:this.$route.query.id
    }
  }
}
</script>
