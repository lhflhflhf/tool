/**
 *  cname 名字
 *  cvalue 值
 *  s20是代表20秒
 *  h是指小时，如12小时则是：h12
 *  d是天数，30天则：d30
 */
const cookie = {
  setCookie(name, value, time) {
    var strsec = this.getsec(time);
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec*1);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
  },
  //获取cookie
  getCookie: function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) !== -1) return c.substring(name.length, c.length);
    }
    return "";
  },

  //清除cookie
  clearCookie: function (c) {
    this.setCookie(c, '', 's0');
  },

  // 获取时间
  getsec (time) {
    var str1 = time.substring(1, time.length) * 1;
    var str2 = time.substring(0,1);
    if (str2 === "s"){
      return str1 * 1000;
    }else if (str2 === "h"){
      return str1 * 60 * 60 * 1000;
    }else if (str2 === "d"){
      return str1 * 24 * 60 * 60 * 1000;
    }
  }
};
export default  cookie;
