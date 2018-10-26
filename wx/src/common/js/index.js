import { md5 } from "vux";
// 配置开发服务器

// var root = "http://crmtest.ajhroro.com/v2api";
// var rooturl = "/v2wx";
var root = "http://9a3f1950.ngrok.io";
var wxEnv = "test";

var rooturl = "/v2wx";
sessionStorage.setItem("rooturl", rooturl);
// 引用axios
var axios = require("axios");

// axios.config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
// //判断是否存在ticket，即判断用户是否登录，如果存在的话，则每个http header都加上ticket

// 返回在vue模板中的调用接口
export default {
  get: function(url, params, success, failure) {
    return this.apiAxios("GET", url, params, success, failure);
  },
  post: function(url, params, success, failure) {
    return this.apiAxios("POST", url, params, success, failure);
  },
  put: function(url, params, success, failure) {
    return this.apiAxios("PUT", url, params, success, failure);
  },
  delete: function(url, params, success, failure) {
    return this.apiAxios("DELETE", url, params, success, failure);
  },
  lsSet: function(k, v) {
    localStorage.setItem(k, v);
  },
  lsGet: function(k) {
    return localStorage.getItem(k);
  },
  ssSet: function(k, v) {
    try {
      sessionStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
  ssGet: function(k) {
    try {
      var v = sessionStorage.getItem(k);
      return v == null ? null : JSON.parse(v);
    } catch (e) {}
  },
  getId(to) {
    var self = this;
    var code = this.getQueryString("code");
    if (code) {
      // 有 code  自动登录
      self.get(
        "crm/login/withWechart?code=" + code,
        null,
        r => {
          var hrefUrl = encodeURI(window.location.href);
          var url2 = hrefUrl.split(rooturl)[0];
          var loginCode = r.repData.loginCode;
          if (loginCode == "0000") {
            var wxUser = {
              loginCode: r.repData.loginCode,
              redisKey: r.repData.redisKey
            };
            this.ssSet("wxUser", wxUser);
            window.location.href = url2 + rooturl + "/login";
          } else if (loginCode == "0001") {
            var wxUser = {
              loginCode: r.repData.loginCode,
              redisKey: r.repData.redisKey
            };
            this.ssSet("wxUser", wxUser);
            window.location.href = url2 + rooturl + "/login";
          } else if (loginCode == "0002") {
            var token = r.repData.token;
            self.ssSet("token", token);
            window.location.href = url2 + to.matched[0].path;
          } else {
          }
        },
        e => {
          console.log(e);
          return;
        }
      );
      // common.getWxUserInfo();
    } else {
      //无code
      //没有微信用户信息，没有授权-->> 需要授权，跳转授权页面 -->> 自动授权跳转登录
      let url = encodeURI(window.location.href);
      // window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxa9bf0219adac8929&redirect_uri=' + url + '&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
      window.location.href =
        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx56fc0754157234a7&redirect_uri=" +
        url +
        "&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
    }
  },
  getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
  /* token校验，加密校验 */
  sign(p) {
    let token = this.ssGet("token");
    let time = new Date().getTime();
    if (token == undefined || token == null) {
      token = "";
    }
    var arr = [];
    for (var item in p) {
      arr.push(item);
    }
    var paramsObj = {};
    var operate = {
      operateCode: "",
      operateName: ""
    };
    for (var i = 0; i < arr.length; i++) {
      var key = arr[i];
      var value = p[key];
      if (key == "operateCode" || key == "operateName") {
        operate.operateCode = p["operateCode"];
        operate.operateName = p["operateName"];
      } else {
        paramsObj[key] = value;
      }
    }

    // 签名校验
    var cr = {
      token: token,
      time: time,
      reqData: JSON.stringify(paramsObj)
    };
    // 排序key
    var keyArr = [];
    for (var item in cr) {
      if (item != "sign") {
        keyArr.push(item);
      }
    }
    keyArr.sort();
    // 生成加密
    var content = "";
    for (var i = 0; i < keyArr.length; i++) {
      var key = keyArr[i];
      var value = cr[key];
      content += key + value;
    }
    var str = content.replace(/time/, ',"front":truetime');
    var signData = {
      form: 1,
      operateCode: operate.operateCode,
      operateName: operate.operateName,
      token: token,
      time: time,
      reqData: paramsObj,
      front: true,
      sign: md5(str).toUpperCase()
    };
    return signData;
  },

  /*
    接口处理函数
    这个函数每个项目都是不一样的，我现在调整的是适用于
    https://cnodejs.org/api/v1 的接口，如果是其他接口
    需要根据接口的参数进行调整。参考说明文档地址：
    https://cnodejs.org/topic/5378720ed6e2d16149fa16bd
    主要是，不同的接口的成功标识和失败提示是不一致的。
    另外，不同的项目的处理方法也是不一致的，这里出错就是简单的alert
  */
  apiAxios(method, url, params, success, failure) {
    let self = this;
    if (params) {
      //params = self.sign(params);
    }
    axios({
      method: method,
      url: url,
      data: method === "POST" || method === "PUT" ? params : null,
      params: method === "GET" || method === "DELETE" ? params : null,
      baseURL: root,
      withCredentials: false,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 100000
      // headers: {
      //   'X-Requested-With': 'XMLHttpRequest',
      //   'Content-Type': 'application/json; charset=UTF-8'
      // }
    })
      .then(function(res) {
        if (res.data.success === true) {
          if (success) {
            success(res.data);
          }
        } else {
          if (failure) {
            failure(res.data);
          } else {
            window.alert("error: " + JSON.stringify(res.data));
          }
        }

        // if (res.data.repCode === '0000') {
        //   if (res.data.success === true) {
        //     if (success) {
        //       success(res.data)
        //     }
        //   } else {
        //     if (failure) {
        //       failure(res.data)
        //     } else {
        //       window.alert('error: ' + JSON.stringify(res.data))
        //     }
        //   }
        // }
        // else if (res.data.repCode === '0104') {
        // alert('0104');
        // var hrefUrl = window.location.href;
        // console.log(hrefUrl);
        // var url = hrefUrl.split('/wx')[1];
        // console.log(url);
        // var to = url.split('?')[0];
        // self.ssSet('token', '')
        // self.getId(to);
        // window.alert('登录过期');
        // }
        // else {
        //   window.alert(JSON.stringify(res.data.repMsg));
        // }
      })
      .catch(function(err) {
        console.log(err);
        window.alert("服务器异常");
      });
  }
};
