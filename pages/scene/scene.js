import resource_manager from "./resource_manager"
import {getSlamV2Support} from "../../utils/utils"; 
const steps = ["findPlane", "showPoint", "startScene"]; // 一些UI限制的步骤

Page({
  data: {
    license: "", // 小程序授权证书，可用来去除水印，联系我们获取，需提供小程序appid
    version: "v1",
    step: "", 
  },

  onLoad() {
    const isSupportV2 = getSlamV2Support();
    if(isSupportV2) {
      this.setData({version: "v2"});
    }

    this.resource = new  resource_manager();
    this.resource.loadAssets();  
    
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  async ready({ detail: slam }) {
    var boo =await this.resource.initScene({ detail: slam });  
    if(boo)
    {
      this.addAnchors(); 
    }
  }, 
  
  // v2模式下有平面新增
  addAnchors() {
    this.setData({ step: steps[1] });
    this.resource.findPlane();
  },

  tap({touches, target}) { 
    var success = this.resource.tap({touches, target});
    if(success)
    {
      this.setData({ step: steps[2] }); 
    } 
  },
 
  error({ detail }) {
    this.resource.error({ detail }); 
  },
});
