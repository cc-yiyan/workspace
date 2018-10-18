import Vue from "vue";
import Router from "vue-router";
import api from "./../common/js/index";
Vue.use(Router);
let rootUrl = sessionStorage.getItem("rooturl");

const router = new Router({
  mode: "history",
  routes: [
    {
      path: rootUrl,
      component: resolve => {
        require(["../components/login/Login"], resolve);
      }
    },
    {
      path: rootUrl + "/login",
      component: resolve => {
        require(["../components/login/Login"], resolve);
      }
    },
    {
      path: rootUrl + "/info",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/info/Info"], resolve);
      }
    },
    {
      path: rootUrl + "/telService",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/info/TelService"], resolve);
      }
    },
    {
      path: rootUrl + "/contactList",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/contact/ContactList"], resolve);
      }
    },
    {
      path: rootUrl + "/contact",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/contact/Contact"], resolve);
      }
    },
    {
      path: rootUrl + "/contactDetail",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/contact/ContactDetail"], resolve);
      }
    },
    {
      path: rootUrl + "/evaluate",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/evaluate/Evaluate"], resolve);
      }
    },
    {
      path: rootUrl + "/evaluateSub",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/evaluate/EvaluateSub"], resolve);
      }
    },
    {
      path: rootUrl + "/order",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/order/OrderList"], resolve);
      }
    },
    {
      path: rootUrl + "/orderSearch",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/order/OrderSearch"], resolve);
      }
    },
    {
      path: rootUrl + "/orderView",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/order/OrderView"], resolve);
      }
    },
    {
      path: rootUrl + "/orderDetail",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/order/OrderDetail"], resolve);
      }
    },
    {
      path: rootUrl + "/agreement",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/agreement/Agreement"], resolve);
      }
    },
    {
      path: rootUrl + "/agreeText",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/agreement/AgreeText"], resolve);
      }
    },
    {
      path: rootUrl + "/sign",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/Sign"], resolve);
      }
    },
    {
      path: rootUrl + "/signSearch",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/SignSearch"], resolve);
      }
    },
    {
      path: rootUrl + "/signDetail",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/SignDetail"], resolve);
      }
    },
    {
      path: rootUrl + "/damageList",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/DamageList"], resolve);
      }
    },
    {
      path: rootUrl + "/damageCommit",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/DamageCommit"], resolve);
      }
    },
    {
      path: rootUrl + "/damageEdit",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/sign/DamageEdit"], resolve);
      }
    },
    {
      path: rootUrl + "/help",
      meta: {
        requireAuth: true
      },
      component: resolve => {
        require(["../components/help/Help"], resolve);
      }
    }
  ]
});
//  判断是否需要登录权限 以及是否登录
router.beforeEach((to, from, next) => {
  if (to.matched.some(res => res.meta.requireAuth)) {
    // 判断是否需要登录权限
    var token;
    api.ssSet("token", "35612692_31ee700ee7274e95be89b51ad554c636");
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
