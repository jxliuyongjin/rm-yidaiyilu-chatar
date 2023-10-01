import resource_manager from "./resource_manager"
import {getSlamV2Support,log} from "../../utils/utils";  

//  initing:场景正在初始化
//  showPoint:初始化已经完成，展示引导放置模型
//  modelSeted：用户点击屏幕，放置了模型
//  modelchanging:正在切换模型,模型加载中
//  showHaibao：用户点击了拍照，正在展示拍照海报
//  baochunhaibao：用户点击了保存，正在保存海报
const steps = ["initing", "showPoint", "modelSeted","modelchanging","showHaibao","baochunhaibao"]; // 一些UI限制的步骤

Page({
  data: {
    license: "", // 小程序授权证书，可用来去除水印，联系我们获取，需提供小程序appid
    version: "v1",
    step: "initing",  
    icon_arrs:[],
    photoPath:"",
    haibaoPhotoPath:"",
    moduleindex:0
  },

  onLoad(options) { 
    this.showLoading("初始化中...",0)
    var moduleindex = options.moduleindex;
    console.log("onload moduleindex:"+moduleindex);
    if(moduleindex<0||moduleindex>6)
    {
      return;
    }
    this.setData({
      moduleindex
    });
    const isSupportV2 = getSlamV2Support(); 
    if(isSupportV2) {
      this.setData({
        version: "v2"
      }); 
    }
 
    this.resource = new  resource_manager();
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    
    ////加载配置
    this.resource.getConfigData();  
  },

  async ready({ detail: slam }) {
    this.slam = slam;
    log("ready 11111"); 
    var moduleindex = this.data.moduleindex;
    var boo = await this.resource.initScene(slam ,moduleindex); 
    console.log("ready resource initscene end");
    if(boo) {
      this.addAnchors(); 
      
      var modelsInfo =  this.resource.getResourceConfig(); 
      modelsInfo.modelsInfo.forEach(function(value){
        value.iconurl =  modelsInfo.baseurl + value.iconurl;
      }); 
      this.setData({ 
        icon_arrs:modelsInfo.modelsInfo
      }) 
    }else{
      wx.hideLoading()
      wx.showToast({
        title: '网络出问题了...',
      })
    }
  }, 
  
  // v2模式下有平面新增
  addAnchors() { 
    log("addAnchors 11111"); 
    this.hideLoading(1);
    this.resource.findPlane();
  },

  tap({touches, target}) { 
    if(this.data.step != steps[1] && this.data.step != steps[2] )
    {
      wx.showToast({
        title: '当前状态不能放置场景',
      })
      this.error("当前状态不能放置场景");
      return;
    }

    var success = this.resource.tap({touches, target});
    if(success)
    {
      this.setData({ step: steps[2] }); 
    } 
  }, 
  
  async changebtn_clicked(event) { 
    if(this.data.step != steps[1] && this.data.step != steps[2] )
    {  
      log("当前状态不能切换场景:"+this.data.step ); 
      return;
    }

    var selectedId = event.currentTarget.id; 
    console.log("changebtn_clicked currentTarget.id:"+selectedId);
    if(this.resource == null) {
      return;
    }
    var currentstep = steps.indexOf(this.data.step);
    this.showLoading("场景加载中...",3);
    var success = await this.resource.selected_model_change(selectedId);
    if(success)
    { 
      this.setData({
        moduleindex:selectedId
      });
    }
    
    log("reset to befor step:"+currentstep)  
    this.hideLoading(currentstep);
  }, 

  async take_photo() {
    if(this.data.step!= steps[2])
    {
      wx.showToast({
        title: '请放置场景再拍照...'+this.data.step,
      })
      return;
    } 

    this.resource.setVisibleReticleMode(false);
    var currentTep = this.data.step;
    this.showLoading("拍照中...",4);
    var that = this;
    try {
      /**
       * 拍照接口
       * @param {Number} [figureWidth=renderWidth] - 指定照片的宽度。高度会依照渲染区域宽高比自动计算出来。默认为渲染宽度。
       * @param {String} [fileType=jpg] - 文件格式，只支持jpg/png。默认为jpg
       * @param {Number} [quality=0.9] - 照片质量，jpg时有效。默认为0.9
       * @returns {Promise<photoPath>} - 照片文件临时地址
       */
      const photoPath = await that.slam.takePhoto(); 
      that.setData({
        photoPath
      })
      
      log("take_photo photoPath:"+that.data.photoPath);
      const query = wx.createSelectorQuery()
      query.select('#showhaibao_canvas')
        .fields({ node: true, size: true })
        .exec((res) => { 
          log("canvas geted...");
          this.drawHaiBao(res[0])    
        })
      console.log("drawHaiBao is out") 
    } catch (e) {
      log("drawhaibao error:"+e)  
      that.hideLoading(currentTep);
      that.error(e); 
    }finally{ 
      this.resource.setVisibleReticleMode(true);
    }
  },

  exitBtnClicked()
  {  
    this.setData({ step: steps[2]}); 
  }, 
  
  //绘制海报
  async drawHaiBao(res)
  {
    log("drawHaiBao inner") 
    var canvas = res.node
    if(!canvas) { 
      console.log("canvas is null");
      return;
    }
    this.canvas = canvas;
    console.log("canvas geted:"+canvas); 
    try{ 
      // 创建离屏 2D canvas 实例 
      // 获取 context。注意这里必须要与创建时的 type 一致
      const canvasContext = canvas.getContext('2d')
  
      const canvas_width = res.width;
      const canvas_height = res.height;
  
      log("drawHaiBao enner 22222");
      //解决绘图不清晰
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res.width * dpr;
      canvas.height = res.height * dpr;
      canvasContext.scale(dpr,dpr); 
      canvasContext.fillRect(0,0,canvas_width,canvas_height); 
      
      // 创建一个图片
      const image = canvas.createImage() 
      // 把图片画到 canvas 上 
      // 等待图片加载
      await new Promise(resolve => {
        image.onload = resolve
        image.src =  this.data.photoPath;// 要加载的图片 url
      })  
  
      // 再创建一个图片
      // const erweiImage = canvas.createImage() 
      // await new Promise(resolve => {
      //   erweiImage.onload = resolve
      //   erweiImage.src = "https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/erwei.jpg" // 要加载的图片 url
      // }) 
      
      const offwidth = canvas_width*0.04;
      const offheight = canvas_height*0.04;
      //context.drawImage(erweiImage, 0, 0, canvas_width, canvas_height);  
      canvasContext.clearRect(0, 0, canvas_width, canvas_height);   
      canvasContext.drawImage(image,offwidth, offheight, canvas_width-offwidth*2, canvas_height-offheight*2); 
      this.getTempImage(canvas)
      this.hideLoading(-1);  
    }
    catch(err) {
      this.error(error);
      this.hideLoading(-1);  
    }
  },

  getTempImage(canvas)
  {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      fileType: 'jpg',
      quality: 1,
      canvas: canvas, 
      success:res=>{  
        wx.hideLoading();
        that.setData({
          haibaoPhotoPath:res.tempFilePath
        })  
        console.log("this.data.haibaoPhotoPath"+that.data.haibaoPhotoPath);
      },
      fail:err=>{ 
        wx.hideLoading();
        console.log(err)
        wx.showToast({ title: "生成照片失败"}); 
      } 
    })   
  },

  async onSaveImageClicked()
  {   
    var tempFilePath = this.data.haibaoPhotoPath;
    if(this.data.step!=steps[4]||!tempFilePath)
    {
      log("没有照片呢...")
      return;
    } 

    this.showLoading("开始保存照片...",5); 
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success() { 
        console.log("保存成功！！！！！！！！！！！！")
        that.hideLoading(4);
        wx.showToast({
          title: '保存成功！',
        })
      },
      fail(e) { 
        console.log("saveImage error")
        that.hideLoading(4);
        that.error(e); 
      }
    }) 
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {  
    return {
      title: '分享',
      path: '/pages/scene/scene',  
    }
  },  
  onShareTimeline(){
    return {
      title: '分享',
      path: '/pages/scene/scene', 
    }
  },
  error({ detail }) {
    this.resource.error({ detail }); 
  },
});
