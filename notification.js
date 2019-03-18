
/**
 * 权限值说明：
 * default  默认值，提示用户是否授权显示通知
 * denied   用户禁止通知
 * granted  用户允许通知
 */


const nfn = (type) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const options ={
    body: `有新文章更新，请及时录音！`,
    icon: "//mat1.gtimg.com/news/dreamreader/app/logo/100x100.png",
    tag: 'tag',
    renotify: true
  }
  // 先检查浏览器是否支持
  if (!("Notification" in window)) {
    alert("你的浏览器不支持消息推送！");
  }
  // 检查用户是否同意接受通知
  else if (Notification.permission === "granted" && !type) {
    new Notification(`Hi ${userInfo ? userInfo.user_name : ''}！`, options);
  }
  // 否则我们需要向用户获取权限
  else if (Notification.permission !== 'denied' && type === 'authorization') {
    Notification.requestPermission();
  }
}

export default nfn
