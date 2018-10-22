<template>
    <div>
        qq{{this.$route.query.loginName}}
    </div>
</template>

<script>
export default {
  data() {
    return {
      viewH: ""
    };
  },
  mounted() {
    this.viewH = window.innerHeight;
    this.loginName = this.$route.query.loginName;
    this.company = this.$route.query.company;
    this.department = this.$route.query.department;
    this.mailbox = this.$route.query.mailbox;
  }
};
</script>

<style scoped>
</style>