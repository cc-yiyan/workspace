/**
 * @author Administrator
 */
(function (doc, win) {
  var docEl = doc.documentElement, isIOS = navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), dpr = isIOS ? Math.min(win.devicePixelRatio, 3) : 1, dpr = window.top === window.self ? dpr : 1, //被iframe引用时，禁止缩放
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    docEl.dataset.dpr = dpr;
  var recalc = function () {
    var width = docEl.clientWidth;
    if (width > 1000) {
      docEl.dataset.width = 1000;
      docEl.dataset.percent = 1000;
      docEl.style.fontSize = 100 * (1000 / 750) + 'px';
      return
    }
    if (width < 320) {
      width = 320;
    }
    docEl.dataset.width = width;
    docEl.dataset.percent = 100 * (width / 750);
    docEl.style.fontSize = 100 * (width / 750) + 'px';
  };
  recalc();
  if (!doc.addEventListener)
    return;
  win.addEventListener(resizeEvt, recalc, false);
})(document, window);
