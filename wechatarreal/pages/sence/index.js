
import {getURL,getNoPURL} from "../../utils/configsetd" 
import {getSlamV2Support,log,errorHandler} from "../../utils/utils";  
const app = getApp();
//  initing:场景正在初始化
//  showPoint:初始化已经完成，展示引导放置模型
//  modelSeted：用户点击屏幕，放置了模型
//  modelchanging:正在切换模型,模型加载中
//  showHaibao：用户点击了拍照，正在展示拍照海报
//  baochunhaibao：用户点击了保存，正在保存海报
const steps = ["initing", "showPoint", "modelSeted","modelchanging","showHaibao","baochunhaibao","findPlane"]; // 一些UI限制的步骤
Page({
  data: {
    width: 300,
    height: 300,
    renderWidth: 300,
    renderHeight: 300,
    reticleUrl:"",
    currentModuleUrl:"",
    step: "initing",  
    showOnPengyouquan:false,
    uiIconsPath:{},
    modelIcons:[],
    iconNames: [],
    iconScrollPos:-1,
    photoPath:"", 
    haibaoPhotoPath:"",
    haibaoPhotoPathErweima:"",
    showSaveBtn:false,
    currentModuleindex:0,
    maskvisible:[]
  },
  setsize(){ 
    const info = wx.getSystemInfoSync();
    const width = info.windowWidth;
    const height = info.windowHeight;
    const dpi = info.pixelRatio; 
    this.setData({
      width, height,
      renderWidth: width * dpi,
      renderHeight: height * dpi
    });
  },
  onLoad(options) {
    this.setsize();
    if(app.globalData.currentSenceId === 1154){
      this.setData({
        showOnPengyouquan:true
      })
      return;
    }
     
    this.onUnload();

    this.canvas = null;
    this.showLoading("场景加载中...",0)
    var moduleindex = 0// parseInt(options.moduleindex);
    log("onload moduleindex:"+moduleindex);  
    if(moduleindex<0||moduleindex>=6) {
      return;
    }
    this.setData({
      currentModuleindex: moduleindex
    });

    const isSupportV2 = getSlamV2Support(); 
    if(isSupportV2) {
      this.setData({
        version: "v2"
      }); 
    }
 
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    
    this.resetTempIcon();
      ////加载配置 
    this.resource_config = app.globalData.resource_config;    
    this.currentModelInfo = this.resource_config.modelsInfo[moduleindex];  
    var reticleurl = getURL(this.resource_config.reticle); 
    var glburl = getURL(this.currentModelInfo.glburl); 
    this.setData({
      reticleUrl: reticleurl,
      currentModuleUrl:glburl
    });  
  },
  onCompReady(evt)
  {
    console.log("onCompReady @@@@");
    this.compReadyed = true;
    this.hideLoading(1)
  },
  onModelLoaded(evt)
  {
    console.log("onModelLoaded evt:"+JSON.stringify(evt));
    if(this.compReadyed === true)
    {
      console.log("change model loaded");
      wx.hideLoading(1);
    }
  },

  exitBtnClicked()
  {    
    wx.reportEvent("button_clicked", {
      "btn_name": "再来一次"
    })
    this.resetTempIcon(); 
    this.clearHaiBao();
    setTimeout(() => { 
      this.setData({ step: steps[2]}); 
    }, 500);
  }, 
  resetTempIcon()
  {
    this.setData({
      haibaoPhotoPath:"",
      haibaoPhotoPathErweima:"",
      showSaveBtn:false
    }) 
  },
  onUnload()
  { 
    this.canvas = null; 
    if(this.resource){
      this.resource.clear(); 
    }
    this.resource = null; 
    this.slam = null;
  },

  
  showLoading(message,step)
  {
    if(step>0&&step<steps.length)
    { 
      this.setData({ step: steps[step] }); 
    } 
    wx.showLoading({ title: message, mask: true });
  }, 
 

  hideLoading(step){ 
    if(step>0&&step<steps.length)
    { 
      this.setData({ step: steps[step] });  
    }
    wx.hideLoading();
  },

})