
const userAgent = navigator.userAgent.toLowerCase();
const ua = {
  iphone: /iphone/.test(userAgent),
  android: /android/.test(userAgent),
  winphone: /windows phone/.test(userAgent),
  qqnews: /qqnews/.test(userAgent),
  weixin: /micromessenger/.test(userAgent),
  mqqbrowser: /mqqbrowser/.test(userAgent),
  qq: /\sqq/.test(userAgent),
  mz: /mz/.test(userAgent)
};

function getUrl () {
  let packageName = '';
  let downloadUrl = 'http://itunes.apple.com/cn/app/id1272580973';
  if (ua.iphone) {
    packageName = 'com.tencent.SuperSecretary';
  } else if (ua.android) {
    packageName = 'com.tencent.dreamreader';
    let _from = '';
    if (ua.weixin) {
      _from = 'weixin_share';
    }else if (ua.qq) {
      _from = 'qq_share';
    }else{
      _from = 'default_share';
    }
    downloadUrl = 'http://dreamreader.qq.com/common/downloadurl?src_from=' + _from;
  }
  return {
    packageName,
    downloadUrl
  }
}

const download = (params={}) => {
  if (window.MtaH5) {
    MtaH5.clickStat("download");
  }
  const { 
    openUrl = '',
    appleId = '1272580973',
    packageName = getUrl().packageName,
    downloadUrl = getUrl().downloadUrl
  } = params;
  const downloadInfo = {
    openUrl,
    packageName,
    downloadUrl,
    appleId
  }
  // 判断环境，不同的环境，不同的检测和唤醒app方法
  if (ua.weixin) {
    handleWx(downloadInfo)
  } else if (ua.qq) {
    getScript("//open.mobile.qq.com/sdk/qqapi.wk.js", function(){
      handleQQ(downloadInfo);
    });
  } else if (ua.mqqbrowser) {
    getScript("http://jsapi.qq.com/get?api=app.isInstallApk", function(){
      handleQBrowser(downloadInfo);
    });
  } else {
    defaultopenApp(downloadInfo);
  }
}

function getScript (file, callback) {
  const head = document.getElementsByTagName('head')[0];
  const js = document.createElement('script');
  js.setAttribute('src', file);
  head.appendChild(js);
  js.onload = js.onreadystatechange = function(){
    if(!this.readyState || this.readyState=='loaded' || this.readyState=='complete'){
      callback && callback();
    }
  };
}

function handleQQ (downloadInfo) {
  let isBind = false;
  if (window.mqq && mqq.app && mqq.app.isAppInstalled) {
    const apkInfo = downloadInfo.packageName;
    if (ua.android) {
      mqq.app.isAppInstalled(apkInfo, function(result){
        if (result) {
          location.href = downloadInfo.openUrl;
        } else {
          downloadApp(downloadInfo);
        }
      });
    } else {
      setTimeout(function() {
        if (!isBind) {
          isBind = true;
          defaultopenApp(downloadInfo);
        }
      }, 500);
    }
  } else {
    defaultopenApp(downloadInfo);
  }
}

function handleWx (urls) {
  let num = 0;
  if (ua.iphone) {
    function getClientVersion (number) {
      var mat = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i);
      var version;
      if (mat && mat.length > 1)
        version = mat[1];
      if (!version) return 0;
      return (number ? version.replace(/\./g, '') : version);
    }
    function versionCompare (versionCurr, versionNext) {
      versionCurr = versionCurr.split('.');
      versionNext = versionNext.split('.');
      var len = Math.min(versionCurr.length, versionNext.length);
      for (let i = 0; i < len; i++) {
          var left = parseInt(versionCurr[i], 10) - parseInt(versionNext[i], 10);
          if (left !== 0)
            return left;
      }
      return (versionCurr.length - versionNext.length);
    }
    var ret = versionCompare(getClientVersion(false), '6.5.5');
    var invokeFunStr = ret > 0 ? 'launchApplication' : 'launch3rdApp';
    var invokeErrStr = ret > 0 ? 'launchApplication:fail' : 'launch_3rdApp:fail';
    WeixinJSBridge.invoke(invokeFunStr, {
      "schemeUrl": urls.openUrl,
      "showLaunchFaildToast": false
    }, function (res) {
      var msg = res.err_msg || res.errMsg;
      if (msg.indexOf(invokeErrStr) > -1) {
        downloadApp(urls);
      }
    });
  } else {
    function checkInstallState() {
      WeixinJSBridge.invoke('getInstallState', {
        'packageName': urls.packageName,   // Android必填
        'packageUrl': urls.openUrl         // IOS必填
      }, function(e) {
        var msg = e.err_msg || e.errMsg;
        var not = msg.indexOf("not_allow") > -1 || msg.indexOf("notAllow") > -1;
        var access = msg.indexOf("access_denied") > -1 || msg.indexOf("accessDenied") > -1;
        var forbiddenFlag =  not ? true: false;
        if (!forbiddenFlag) {
          forbiddenFlag = access ? true: false;
        }
        if (forbiddenFlag && num < 2) {
          num ++;
          setTimeout(function() {
            checkInstallState();
          }, 500 * num);
          return;
        }
        if (forbiddenFlag) {
          openAppInWx(urls.openUrl);
        }
        if (msg.indexOf("get_install_state:yes") > -1 || msg.indexOf("getInstallState:yes") > -1) {
          openAppInWx(urls.openUrl);
        } else {
          downloadApp(urls);
        }
      });
    }
    checkInstallState();
  }
}

function openAppInWx (url) {
  var param = {
    schemeUrl : url
  };
  var ss = navigator.userAgent.toLowerCase().match(/micromessenger\/(\d+)\.(\d+)\.(\d+)/)
  var n = 0;
  ss && ss.length >= 4 && (n = 100 * parseInt(ss[1]) + parseInt(ss[2]) + parseInt(ss[3]) / 1000);
  if(n > 605.006){
    WeixinJSBridge.invoke("launchApplication", param, function () {
    
    });
  }else{
    location.href = url;
  }
}

function handleQBrowser (downloadInfo) {
  var apkInfo = "";
  var isInstalled = false;
  if(ua.android){
    apkInfo = '{"packagename":' + downloadInfo.packageName +'}';
    if (window.x5mtt && window.x5mtt.isApkInstalled) {
      isInstalled = window.x5mtt.isApkInstalled(apkInfo);
      if (isInstalled === -1) {
        isInstalled = false;
      }
      if (isInstalled) {
        openApp(downloadInfo);
      } else {
        downloadApp(downloadInfo);
      }
    } else {
      defaultopenApp(downloadInfo);
    }
  }else{
    browser.app.isInstallApk(function(data){
      if(JSON.stringify(data) === "true"){
        openApp(downloadInfo);
      }else{
        defaultopenApp(downloadInfo);
      }
    }, {apkKey: downloadInfo.openUrl});
  }
}

function defaultopenApp (urls) {
  var startTime = (new Date).valueOf();
  if (ua.android) {
    var e = document.createElement("iframe");
    e.style.cssText = "width:1px;height:1px;position:fixed;top:0;left:0;";
    e.src = urls.openUrl;
    document.body.appendChild(e);
    startTime = (new Date).valueOf();
  } else {
    location.href = urls.openUrl;
  }
  setTimeout(function () {
    var endTime = (new Date).valueOf();
    if (1550 > endTime - startTime) {
      downloadApp(urls);
    }
  }, 1500);
}

function openApp (downloadInfo) {
  location.href = downloadInfo.openUrl;
}

function downloadApp (downloadInfo) {
  location.href = downloadInfo.downloadUrl;
}

export default download;