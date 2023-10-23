import resource_manager from "./resource_manager" 
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
    license: "ad51dc82b4846b28943338eeaac37f5605498aa79e568f7fdd3074405c8bf58cf9376c502f118f16080716e102239ff3277749b489f35b7b3d7fbc7df486540d", // 小程序授权证书，可用来去除水印，联系我们获取，需提供小程序appid
    version: "v1",
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

  onLoad(options) {    
    if(app.globalData.currentSenceId === 1154){
      this.setData({
        showOnPengyouquan:true
      })
      return;
    }
    
    if(app.globalData.hasLoadIndex === false){  
      return;
    }

    this.onUnload();

    wx.reportEvent("page_show", {
      "page_name":"场景界面"
    })
    this.canvas = null;
    this.showLoading("场景加载中...",0)
    var moduleindex = parseInt(options.moduleindex);
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
    this.resource = new  resource_manager();
    this.resource.onload(moduleindex);  
  },

  initData(moduleindex) { 
    //初始化配置
    var getModelsInfo =  this.resource.getModelsInfo();   
    var iconNames = [];  var maskvisible = [];   
    for(var i=0;i<getModelsInfo.length;i++)
    { 
      maskvisible[i] = 1;
      iconNames[i] = "icon"+i;
    }  
    var uiIconsPath = this.setUIPath(); 
    
    if(moduleindex>2)
    {
      var iconScrollPos = moduleindex-2;
      this.setData({ 
        modelIcons:getModelsInfo,
        uiIconsPath,
        iconNames,
        maskvisible,
        iconScrollPos
      })
    }
    else{
      this.setData({ 
        modelIcons:getModelsInfo,
        uiIconsPath,
        iconNames,
        maskvisible,
      })
    }
  },

  onUnload()
  {
    console.log("#################### onunload #######################")
     
    this.canvas = null; 
    if(this.resource){
      this.resource.clear(); 
    }
    this.resource = null; 
    this.slam = null;
  },

  setUIPath()
  {  
    var takephotoBtnIcon = getURL("ui/content/photoBtn.png");
    var anotherIcon = getURL("ui/drawphoto/another.png");
    var savebtnIcon = getURL("ui/drawphoto/savebtn.png");
    var changeBtnMark = getURL("ui/content/mask.png");

    var topbord = getURL("ui/content/topbord.png");
    var bottombord = getURL("ui/content/bottombord.png");
    
    var photoBgIcon =getNoPURL("bg.png");
    var erweimaIcon = getNoPURL("erweima.png");
    var kuangIcon = getNoPURL("kuang.png"); 
    var bottombordcanvas = getNoPURL("bottombord.png"); 
    var textfIcon = getNoPURL("textf.png"); 

    var renmingwang = getNoPURL("renmingwang.png"); 
    var jiuselu = getNoPURL("jiuselu.png"); 
    var chufa = getNoPURL("chufa.png");  
    return {
      topbord,
      bottombord,
      takephotoBtnIcon,
      photoBgIcon,
      anotherIcon,
      erweimaIcon,
      kuangIcon,
      savebtnIcon,
      textfIcon,
      jiuselu,
      renmingwang,
      chufa,
      bottombordcanvas,
      changeBtnMark
    }
  },

  async ready({ detail: slam }) {
    if(app.globalData.hasLoadIndex===false){  
      wx.navigateTo({ url: "/pages/index/index"});
      return; 
   }
 
    this.slam = slam; 
    var moduleindex = this.data.currentModuleindex; 
    this.initData(moduleindex);
    var boo = await this.resource.initScene(slam ,moduleindex);  
    if(boo) { 
      if (this.data.version === "v1") { 
        this.addAnchors(); 
      }else{ 
        this.hideLoading(6); 
      } 
    }else{
      wx.hideLoading()
      wx.showToast({
        title: '网络出问题了...',
      })
    }
    
    this.setmaskvisible(moduleindex);
  }, 
  
  // v2模式下有平面新增
  addAnchors() {  
    console.log("addAnchors gogogo："+this.data.step);
    if(this.data.step != steps[0] &&this.data.step != steps[1] && this.data.step != steps[2] &&this.data.step != steps[6] )  {
      console.log("addAnchors !!1111111gogogo：");
      return;
    }
    console.log("addAnchors !!222222222222222 1gogogo：");
    if(this.data.step == steps[6]||this.data.step == steps[0])
    {
      this.hideLoading(1); 
    }else{ 
      this.hideLoading(-1);
    }
    this.resource.findPlane();
  },

  tap({touches, target}) { 
    console.log("tap touches:"+touches)
    if(this.data.step != steps[1] && this.data.step != steps[2] )
    {
      wx.showToast({
        title: '当前状态不能放置场景',
      })
      this.error("当前状态不能放置场景");
      return;
    }

    this.resource.tap(this.tapback); 
  }, 

  tapback(success)
  {
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
    var selectedId = this.data.iconNames.indexOf(event.currentTarget.id);
    console.log("changebtn_clicked currentTarget.id:"+selectedId);
    this.setmaskvisible(selectedId);
    if(this.resource == null) {
      return;
    } 
    this.showLoading("场景加载中...",3); 
    var success = await this.resource.selected_model_change(selectedId);
    if(success)
    { 
      this.setData({
        currentModuleindex:selectedId
      }); 
    }else{
      this.setmaskvisible(this.data.currentModuleindex)
    }
    
    //log("this.data.moduleindex:"+this.data.currentModuleindex);  
    this.hideLoading(1); 
  }, 

  setmaskvisible(tempMmodelIndex){
    var tempArr =  this.data.maskvisible;  
    for(var index = 0;index<tempArr.length;index++)
    {  
      if(index == tempMmodelIndex) {
        tempArr[index] = 0; 
      } else{ 
        tempArr[index] =1; 
      }
    } 
    this.setData({
      maskvisible:tempArr
    }) 
  },

  stopClick(){

  },
  ///////////////////////////////////以下关于海报/////////////////////////////////////////////////
  async take_photo(e) {  
    if(this.data.step!= steps[2])
    {
      wx.showToast({
        title: '请放置场景再拍照...'+this.data.step,
      })
      return;
    }  
    this.resetTempIcon(); 

    wx.reportEvent("button_clicked", {
      "btn_name": "拍照"
    })
    this.resource.setVisibleReticleMode(false);
    var currentTep = this.data.step;
    this.showLoading("拍照中...",4); 
    try {
      /**
       * 拍照接口
       * @param {Number} [figureWidth=renderWidth] - 指定照片的宽度。高度会依照渲染区域宽高比自动计算出来。默认为渲染宽度。
       * @param {String} [fileType=jpg] - 文件格式，只支持jpg/png。默认为jpg
       * @param {Number} [quality=0.9] - 照片质量，jpg时有效。默认为0.9
       * @returns {Promise<photoPath>} - 照片文件临时地址
       */
      const photoPath = await this.slam.takePhoto({quality:0.3});  
      getMeiYan(photoPath,this.meiyanResult)
    } catch (e) {
      log("drawhaibao error:"+e)   
      this.hideLoading(currentTep);
      this.error(e); 
    }finally{ 
      this.resource.setVisibleReticleMode(true);
    }
  },  

  meiyanResult(beauty_url,code=0)
  { 
    if(code != 0)
    {
      wx.hideLoading();
      wx.showToast({
        title: '美颜报错了：'+beauty_url,
      })
      return ;
    }
    this.setData({
      photoPath:beauty_url
    })
    log("take_photo photoPath:"+this.data.photoPath);
    if(this.canvas!==null) {
      this.drawHaiBao(this.canvas)    
    } else{
      const query = wx.createSelectorQuery()
      query.select('#showhaibao_canvas')
        .fields({ node: true, size: true })
        .exec((res) => { 
          log("canvas geted...");
          this.drawHaiBao(res[0].node)    
        })
      console.log("drawHaiBao is out")
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
  clearHaiBao()
  {
    if(this.canvas !==null) { 
      const dpr = wx.getSystemInfoSync();
      var canvasContext = this.canvas.getContext('2d') 
      canvasContext.fillRect(0,0,dpr.windowWidth, dpr.windowHeight);   
      canvasContext.clearRect(0, 0, dpr.windowWidth, dpr.windowHeight);  
      console.log("dpr.windowWidth:"+dpr.windowWidth)
    }
  },
    //绘制海报
  async drawHaiBao(canvas)
  {  
    if(!canvas) { 
      log("canvas is null");
      return;
    }
    this.canvas = canvas;
    console.log("canvas geted:"+canvas); 
    try{ 
      // 创建离屏 2D canvas 实例 
      // 获取 context。注意这里必须要与创建时的 type 一致
      const canvasContext = canvas.getContext('2d') 
   
      //解决绘图不清晰
      const system =  wx.getSystemInfoSync();
      const dpr =system.pixelRatio;
      const canvas_width = system.windowWidth;
      const canvas_height = system.windowHeight;
      canvas.width = canvas_width * dpr;
      canvas.height = canvas_height * dpr;
      canvasContext.scale(dpr,dpr); 
      canvasContext.fillRect(0,0,canvas_width,canvas_height);  
      canvasContext.clearRect(0, 0, canvas_width, canvas_height);     

      var imageHW = canvas_height/canvas_width;
      const imageWidth = canvas_width;
      const imageHeight = canvas_height; 
      const imageLeft = 0;
      const imageTop = 0; 

      // 创建一个图片
      const image = canvas.createImage();
      image.referrerPolicy = "origin";
      // 把图片画到 canvas 上 
      // 等待图片加载
      await new Promise(resolve => {
        image.onload = resolve;
        image.src =  this.data.photoPath;// 要加载的图片 url
      })   
      canvasContext.drawImage(image, imageLeft, imageTop, imageWidth, imageHeight); 
      
      const bottombordHeight = canvas_width*0.4427
      const bottomFill = canvas_height - bottombordHeight; 

      const  bottombord = canvas.createImage() 
      bottombord.referrerPolicy = 'origin'; 
      await new Promise(resolve => {
        bottombord.onload = resolve;
        bottombord.src = this.data.uiIconsPath.bottombordcanvas; // 要加载的图片 url 
      }) 
      canvasContext.drawImage(bottombord, 0, bottomFill, canvas_width, bottombordHeight);

      var tht = this;  
      

      const erweiWidth = canvas_width*0.1653;
      const erweiHeight = erweiWidth; 
      const erweitop = bottomFill + bottombordHeight*0.223;
      const erweiLeft = canvas_width*0.7747;
      //绘制二维码
      const erweimaImage = canvas.createImage();
      erweimaImage.referrerPolicy = "origin";
      await new Promise(resolve => {
        erweimaImage.onload = resolve;
        erweimaImage.src =this.data.uiIconsPath.erweimaIcon;// 要加载的图片 url
      }) 
      canvasContext.drawImage(erweimaImage, erweiLeft, erweitop, erweiWidth, erweiHeight);  
        
      const textWidth = canvas_width*0.111;
      const textHeight =  textWidth*0.253;
      const texttop = erweitop + erweiHeight + canvas_width*0.016;
      const textLeft = erweiLeft - (textWidth  - erweiWidth)*0.5;
      //绘制文本
      const textmaImage = canvas.createImage();
      textmaImage.referrerPolicy = "origin";
      await new Promise(resolve => {
        textmaImage.onload = resolve;
        textmaImage.src = this.data.uiIconsPath.textfIcon;// 要加载的图片 url
      }) 
      canvasContext.drawImage(textmaImage, textLeft, texttop, textWidth, textHeight);
        
      const rmtextWidth = canvas_width*0.3027;
      const  rmtextHeight =  rmtextWidth*0.1542;
      const rmtexttop = texttop +textHeight + canvas_width*0.047;
      const rmtextLeft = canvas_width -rmtextWidth-  canvas_width*0.0747;
      //绘制文本
      const rmtextmaImage = canvas.createImage();
      rmtextmaImage.referrerPolicy = "origin";
      await new Promise(resolve => {
        rmtextmaImage.onload = resolve;
        rmtextmaImage.src = this.data.uiIconsPath.renmingwang;// 要加载的图片 url
      }) 
      canvasContext.drawImage(rmtextmaImage,  rmtextLeft, rmtexttop, rmtextWidth, rmtextHeight);  


      const cftextWidth = canvas_width*0.416;
      const  cftextHeight =  cftextWidth*0.52;
      const cftexttop = bottomFill + canvas_width*0.1;
      const cftextLeft =  canvas_width*0.24;
      //绘制文本
      const cftextmaImage = canvas.createImage();
      cftextmaImage.referrerPolicy = "origin";
      await new Promise(resolve => {
        cftextmaImage.onload = resolve;
        cftextmaImage.src = this.data.uiIconsPath.chufa;// 要加载的图片 url
      }) 
      canvasContext.drawImage(cftextmaImage, cftextLeft,cftexttop,  cftextWidth, cftextHeight);  


      const jslWidth = canvas_width*0.187;
      const  jslHeight =  jslWidth*0.6642;
      const jsltop = cftexttop + canvas_width*0.125;
      const jslLeft = cftextLeft - canvas_width*0.111;
      //绘制文本
      const jslImage = canvas.createImage();
      jslImage.referrerPolicy = "origin";
      await new Promise(resolve => {
        jslImage.onload = resolve;
        jslImage.src = this.data.uiIconsPath.jiuselu;// 要加载的图片 url
      }) 
      canvasContext.drawImage(jslImage, jslLeft,jsltop,  jslWidth, jslHeight); 


      console.log("start getTempImage:")
      this.getTempImage(canvas).then(res=>{
          console.log("res.tempFilePath:"+res.tempFilePath)
          tht.setData({
            //haibaoPhotoPathErweima:res.tempFilePath 
            haibaoPhotoPath:res.tempFilePath ,
            showSaveBtn:true
          })    
          log("this.data.haibaoPhotoPathErweima:"+tht.data.haibaoPhotoPath);  
          wx.hideLoading();
      }).catch(err=>{ 
          wx.hideLoading();
          wx.showToast({ title: "生成照片失败"}); 
          this.error(err)
      }) 
    }
    catch(err) { 
      this.error(err)
    }
  }, 

  getTempImage(canvas)
  { 
    return new Promise((resolve,reject)=>{ 
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          fileType: 'jpg',
          quality: 1,
          canvas: canvas, 
          success:res=>{  
            resolve(res);
          },
          fail:err=>{ 
            reject(err)
          } 
        })   
    })
  },

  async onSaveImageClicked()
  {  
    var tempFilePath = this.data.haibaoPhotoPath;//this.data.photoPath;//this.data.haibaoPhotoPath;
    if(this.data.step!=steps[4]||tempFilePath.length===0)
    {
      log("没有照片呢...")
      return;
    } 
    wx.reportEvent("button_clicked", {
      "btn_name": "保存照片"
    })
    this.showLoading("开始保存照片...",5); 
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success() { 
        log("保存成功！！！！！！！！！！！！")
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

  /////////////////////////分享////////////////////////////////// 
  onShareAppMessage() {
    return {
      title: "穿越古今，送你一趟丝路之旅",
      path: "/pages/index/index",
      imageUrl: getNoPURL("share.jpg")
    };
  },

  /**
   * 用户点击右上角盆友圈分享
   */
  onShareTimeline(){ 
    return {
      title: "穿越古今，送你一趟丝路之旅",
      imageUrl:getNoPURL("share.jpg")
    }
  },
  
  error(detail) {  
    errorHandler(detail);
  },
  slamError({ detail })
  {
    wx.hideLoading(); 
    errorHandler(detail);
  }

});
