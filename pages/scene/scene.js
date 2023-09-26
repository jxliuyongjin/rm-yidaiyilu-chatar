import resource_manager from "./resource_manager"

Page({
  data: {
    license: "", // 小程序授权证书，可用来去除水印，联系我们获取，需提供小程序appid
    showGuide: false,
  },

  onLoad() {
    this.resource = new  resource_manager();
    this.resource.loadAssets(); 
  },

 ready({ detail: slam }) {
    var boo = this.resource.initScene({ detail: slam });  
    if(boo)
    {
      this.setData({ showGuide: true }); 
    }
  },

  tap({touches, target}) { 
    var success = this.resource.tap({touches, target});
    if(success)
    {
      this.setData({ showGuide: false }); 
    } 
  },

  error({ detail }) {
    this.resource.error({ detail }); 
  },
});
