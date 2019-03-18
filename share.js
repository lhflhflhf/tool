/**
 * @param {string} img_url 分享缩略图链接
 * @param {string} desc 分享文本
 * @param {string} title 分享标题
 * 使用说明：在入口文件通过 WeixinJSBridgeReady 事件调用此函数完成初始化分享
 * 后续只需调用函数传入相应的参数
 */

function onBridgeReady({ img_url = '', desc = '', title = '' }) {
  let shareData = {
    img_width: '120',
    img_height: '120',
    img_url,
    link: window.location.href.split('#')[0],
    desc,
    title
  };
  // 转发朋友圈
  WeixinJSBridge.on('menu:share:timeline', function (e) {
    WeixinJSBridge.invoke('shareTimeline', shareData, function (res) {
      WeixinJSBridge.log(res.errMsg);
    });
  });
  // 分享到qq
  WeixinJSBridge.on('menu:share:qq', function (e) {
    WeixinJSBridge.invoke('shareQQ', shareData, function (res) {
      WeixinJSBridge.log(res.errMsg);
    });
  });
  // 分享到q空间
  WeixinJSBridge.on('menu:share:QZone', function (e) {
    WeixinJSBridge.invoke('shareQZone', shareData, function (res) {
      WeixinJSBridge.log(res.errMsg);
    });
  });
  // 同步到微博
  WeixinJSBridge.on('menu:share:weibo', function () {
    WeixinJSBridge.invoke('shareWeibo', {
      'content': shareData.desc,
      'url': shareData.link
    }, function(res) {
      WeixinJSBridge.log(res.errMsg);
    });
  });
  // 分享给朋友
  WeixinJSBridge.on('menu:share:appmessage', function () {
    WeixinJSBridge.invoke('sendAppMessage', shareData, function (res) {
      WeixinJSBridge.log(res.errMsg);
    });
  });
}

export default onBridgeReady;