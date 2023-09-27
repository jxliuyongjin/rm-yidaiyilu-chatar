import resource_manager from "./resource_manager"
import {getSlamV2Support} from "../../utils/utils";  

//  initing:场景正在初始化
//  showPoint:初始化已经完成，展示引导放置模型
//  modelSeted：用户点击屏幕，放置了模型
//  showHaibao：用户点击了拍照，正在展示拍照海报
const steps = ["initing", "showPoint", "modelSeted","showHaibao"]; // 一些UI限制的步骤

Page({
  data: {
    license: "", // 小程序授权证书，可用来去除水印，联系我们获取，需提供小程序appid
    version: "v1",
    step: "", 
    icon_arrs:[],  
    photoPath:""
  },

  onLoad() {
    const isSupportV2 = getSlamV2Support(); 
    if(isSupportV2) {
      this.setData({
        version: "v2"
      }); 
    }

    this.resource = new  resource_manager();
    ////加载配置
    var icon_arrstemp = this.resource.getConfigData();
    this.setData({
      icon_arrs:icon_arrstemp,
      step:steps[0] 
    });
    //console.log(JSON.stringify(this.data.icon_arrs));

    this.resource.loadAssets();   
    
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  async ready({ detail: slam }) {
    this.slam = slam;
    var boo = await this.resource.initScene({ detail: slam });   
    if(boo) {
      this.addAnchors(); 
    } 
  }, 
  
  // v2模式下有平面新增
  addAnchors() {
    this.setData({ step: steps[1] });
    this.resource.findPlane();
  },

  tap({touches, target}) {  
    if(this.data.step != steps[1] && this.data.step != steps[2] )
    {
      wx.showToast({
        title: '当前状态不能切换场景',
      })
      this.error("当前状态不能切换场景");
    }

    var success = this.resource.tap({touches, target});
    if(success)
    {
      this.setData({ step: steps[2] }); 
    } 
  }, 
  
  changebtn_clicked(event) { 
    if(this.data.step != steps[1] && this.data.step != steps[2] )
    {
      wx.showToast({
        title: '当前状态不能切换场景',
      })
      this.error("当前状态不能切换场景");
    }
    var selectedId = event.currentTarget.id;
    console.log("changebtn_clicked currentTarget.id:"+selectedId);
    if(this.resource == null) {
      return;
    }
    this.resource.selected_model_change(selectedId);
  }, 

  async take_photo() {
    if(this.data.step!= steps[2])
    {
      wx.showToast({
        title: '请放置场景再拍照...',
      })
      return;
    }

    this.resource.setVisibleReticleMode(false);
    wx.showLoading({ title: "拍照中...", mask: true });
    try {
      /**
       * 拍照接口
       * @param {Number} [figureWidth=renderWidth] - 指定照片的宽度。高度会依照渲染区域宽高比自动计算出来。默认为渲染宽度。
       * @param {String} [fileType=jpg] - 文件格式，只支持jpg/png。默认为jpg
       * @param {Number} [quality=0.9] - 照片质量，jpg时有效。默认为0.9
       * @returns {Promise<photoPath>} - 照片文件临时地址
       */
      const photoPath = await this.slam.takePhoto(); 
      this.setData({
        photoPath:photoPath
      })  
      this.setData({ step: steps[3] }); 
      this.resource.setVisibleReticleMode(true);
      wx.hideLoading(); 
    } catch (e) {
      wx.hideLoading(); 
      this.resource.setVisibleReticleMode(true);
      this.error(e);
      //errorHandler(`拍照失败 - ${e.message}`);
    }
  },

  exitBtnClicked()
  {  
    this.setData({ step: steps[2]}); 
  },
  
  saveBtnClicked() { 
    wx.showLoading({ title: "照片保存中...", mask: true });
    wx.saveImageToPhotosAlbum({
      filePath: this.data.photoPath,
      success() {
        wx.hideLoading();
        wx.showToast({ title: "保存照片成功", icon: "success" }); 
      },
      fail(e) {
        wx.hideLoading();
        this.error(e);
        wx.showToast({ title: "保存照片失败", icon: "error" }); 
      }
    }) 
  },


  error({ detail }) {
    this.resource.error({ detail }); 
  },
});
