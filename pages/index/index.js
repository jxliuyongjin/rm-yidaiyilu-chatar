// index.js
const app = getApp();
Page({ 
  data: {
    sceneId: '0b67f1deac521f34379f0cf4faef99e1',
    params: "&shadow=0.15&ambient=0.3&directional=2.5&horizontal=0&vertical=0&envMap=default&size=30&rotation=0&animation=&animationLoop=true&shareImage=&gyroscope=false", 
    shareimages:"$shareImage=https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/erwei.jpg",
    onloading:true,
    imageLoadednum:0,
  },
 
  onLoad() {  
    this.setData({
    imageLoadednum:0
  }) 
    this.setData({
      onloading:true
    })  
  },  

  onShareAppMessage() {
    return {
      title: app.globalData.appName,
      path: this.data.sharePagePath,
      imageUrl: app.globalData.shareImg,
    };
  },

  imageLoaded(e)
  {
    var imageLoadednum = this.data.imageLoadednum+1; 
    this.setData({
      imageLoadednum
    }) 
    if(imageLoadednum>=13)
    {
      this.setData({
        onloading:false
      })  
    } 
  },
 
  gotoModel(e){
    console.log(e.target.id==1);
    var moduleindex = e.target.id
    if(moduleindex<0||moduleindex>6)
    {
      return;
    }
    wx.navigateTo({ url: `/pages/scene/scene?moduleindex=${moduleindex}`});
  }
});
