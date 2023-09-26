// index.js
const app = getApp();
Page({ 
  data: {
    sceneId: '0b67f1deac521f34379f0cf4faef99e1',
    params: "&shadow=0.15&ambient=0.3&directional=2.5&horizontal=0&vertical=0&envMap=default&size=30&rotation=0&animation=&animationLoop=true&shareImage=&gyroscope=false", 
    shareimages:"$shareImage=https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/erwei.jpg"
  },
 
  // 不带参数
  handleAr(){
    // wx.uma.trackEvent("home_entry_slamScene", {sceneId: this.data.sceneId});
    wx.navigateTo({ url: `plugin://kivicube-slam/scene?id=${this.data.sceneId}` });
  },

  // 带参数
  handleArWithParams() {
    // wx.uma.trackEvent("home_entry_slamScene", {sceneId: this.data.sceneId});
    wx.navigateTo({ url: `plugin://kivicube-slam/scene?id=${this.data.sceneId}${this.data.params}` });
  },

  // 进入插件组件页面
  handleUseComponent() { 
    wx.navigateTo({ url: "/pages/scene/scene" });
  },

  onShareAppMessage() {
    return {
      title: app.globalData.appName,
      path: this.data.sharePagePath,
      imageUrl: app.globalData.shareImg,
    };
  },


});
