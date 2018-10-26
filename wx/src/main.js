// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import App from './App'
import base from './common/js/base'
import api from './common/js/index'
Vue.prototype.$api = api
// 引用路由
import router from './router/index'
import { ToastPlugin,ConfirmPlugin,AlertPlugin,WechatPlugin} from 'vux'

Vue.use(WechatPlugin)//使用微信插件
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(AlertPlugin)
FastClick.attach(document.body)

// import VueTitle from 'vue-wechat-title'
// Vue.use(VueTitle)
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
