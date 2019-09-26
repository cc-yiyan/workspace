import Vue from "vue";
import Router from "vue-router";
import api from "./../common/js/index";
Vue.use(Router);
// let rootUrl = sessionStorage.getItem("rooturl");
let rootUrl = "";
const router = new Router({
  mode: "hash",
  routes: [
    {
      path: "/proposal",
      component: resolve => {
        require(["../page/proposal"], resolve);
      }
    },
    
  ]
});
//  判断是否需要登录权限 以及是否登录
router.beforeEach((to, from, next) => {
  if (to.matched.some(res => res.meta.requireAuth)) {
    // 判断是否需要登录权限
    var token;
    api.ssSet("token", "35612692_09df42b993a049c8b6e7bcdf9244fa9b");
    token = api.ssGet("token");
    if (token != null && token != undefined) {
      next();
    } else {
      api.getId(to);
    }
  } else {
    next();
  }
});
export default router;
