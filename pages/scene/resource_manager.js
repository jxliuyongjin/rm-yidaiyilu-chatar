import { errorHandler,requestFile,showAuthModal,log} from "../../utils/utils" 

class resource_manager {
  constructor() {} 
  
  getConfigData()
  { 
    var configurl = "https://yidaiyilu-s.oss-cn-shanghai.aliyuncs.com/resource/glbconfig.json";  
    this.configPromise =  requestFile(configurl,"text"); 
    var that = this;
    this.configPromise.then(res =>{ 
      that.resource_config = res;  
    }); 
  }
  getConfigPromise()
  {
    return this.configPromise;
  }
  getModelsInfo()
  {
    return this.resource_config.modelsInfo;
  }
  /**
   * 初始化场景和模型，但此时还没有将模型加入到场景内。
   * 只能在slam组件ready后使用
   * @param {*} slam 传入的slam对象
   * @memberof Food
   */
  async initScene(slam , index=0) {   
    if(!this.resource_config) {
      this.resource_config = await this.configPromise;   
    }  
 
    try { 
      this.slam = slam; 
      this.modelIndex = index; 
      const [
        reticleArrayBuffer, 
        glbArrayBuffer,
      ] = await this.fristLoadSource(index); 
      
      log("initScene inner"); 
      const [reticleModel, current_model] = await Promise.all([
        slam.createGltfModel(reticleArrayBuffer),
        slam.createGltfModel(glbArrayBuffer), 
      ]);  
       
      slam.enableShadow(); // 开启阴影功能

      current_model.visible = false;  
      var modelsize = this.currentModelInfo? this.currentModelInfo.size:0.5;  
      slam.defaultAmbientLight.intensity = this.currentModelInfo.defaultAmbientLight;
      slam.defaultDirectionalLight.intensity = this.currentModelInfo.defaultDirectionalLight;
      slam.add(current_model, modelsize,0);
      // 让模型可用手势进行操作。默认点击移动到平面上的新位置，单指旋转，双指缩放。
      slam.setGesture(current_model);   

      log("initScene set end"); 
      this.current_model = current_model;  
      this.reticleModel = reticleModel;  
 
      await slam.start();  
      return true;
    } catch (e) {
      errorHandler(e);
      return false;
    }
  } 
  
  fristLoadSource(index=0)
  {
    log("fristLoadSource："+ this.resource_config);  

    this.currentModelInfo = this.resource_config.modelsInfo[index]; 
    var reticleurl = this.geturl(this.resource_config.reticle); 
    var glburl = this.geturl(this.currentModelInfo.glburl);

    if(this.currentModelInfo&&reticleurl)
    {  
      var downloadAssets = Promise.all([
        requestFile(reticleurl), 
        requestFile(glburl)
      ]).then((res) => { 
        return res;
      });  
      return downloadAssets;
    }
    return downloadAssets;
  }

  
  setVisibleReticleMode(bool)
  {
    if(this.reticleModel)
    {
      this.reticleModel.visible = bool; 
    }
  }

  async selected_model_change(index)
  {   
    if(index<0||index>=this.resource_config.length) { return false; } 
    if(this.index == index || !this.slam) {
      return false;
    }  

    this.index = index;  
    if(this.current_model)
    {
      this.slam.remove(this.current_model);
      // 销毁创建的3D对象(回收内存)
      this.slam.destroyObject(this.current_model); 
    } 

    this.currentModelInfo = this.resource_config.modelsInfo[index];  
    var glburl = this.geturl(this.currentModelInfo.glburl);

    const glbArrayBuffer = await requestFile(glburl);
    this.current_model  = await this.slam.createGltfModel(glbArrayBuffer)
    
    var modelsize = this.currentModelInfo?this.currentModelInfo.size:0.5; 
    console.log("set_current_glb modelsize:"+modelsize);
     
    this.slam.defaultAmbientLight.intensity = this.currentModelInfo.defaultAmbientLight;
    this.slam.defaultDirectionalLight.intensity = this.currentModelInfo.defaultDirectionalLight;
    this.slam.add(this.current_model, modelsize,0); 
    this.current_model.visible = false;
     // 让模型可用手势进行操作。默认点击移动到平面上的新位置，单指旋转，双指缩放。
    this.slam.setGesture(this.current_model); 
   
    // this.tap()
    return true;
  }

  /**
   * 找平面
   * @memberof Food
   */
  findPlane() { 
    const { slam ,reticleModel} = this; 
    slam.addPlaneIndicator(reticleModel, {
       // camera画面中心，可以映射到平面上某一个点时调用
       onPlaneShow() {
        // console.log("指示器出现");
      },
      // camera画面中心，**不可以**映射到平面上某一个点时调用。
      onPlaneHide() {
        // console.log("指示器隐藏");
      },
      // camera画面中心，可以映射到平面上某一个点时，**持续**调用。
      // 因此可以用此方法，让指示器旋转起来。 
      onPlaneShowing() {
        reticleModel.rotation.y += 0.02;
      },
    });  
  }

  /**
   * 开始场景，将设定好的模型加入到场景内
   * @memberof Food
   */
  tap(tapback) {    
    // 注意：只有开启slam平面追踪(slam.start())之后，才能让模型去尝试站在平面上。
    const { windowWidth, windowHeight } = wx.getSystemInfoSync();
    // 主动让模型站在屏幕中心映射到平面上的位置点。
    // 此处组件全屏展示，所以窗口宽度除以2
    const x = Math.round(windowWidth / 2);
    // 此处组件全屏展示，所以窗口高度除以2
    const y = Math.round(windowHeight / 2);
    // 首次调用standOnThePlane，resetPlane参数必须设为true，以便确定一个平面。
    // 如果为false，代表使用已经检测到的平面。默认为true。
    var resetPlane =true;
    if(this.notFristset === true){
      resetPlane = false;
    }
    this.notFristset = true;
    /**
     * 让3D素材对象，站立在检测出来的平面之上。
     * @param {Base3D} base3D - 3D对象
     * @param {Number} x - kivicube-slam组件上的x轴横向坐标点
     * @param {Number} y - kivicube-slam组件上的y轴纵向坐标点
     * @param {Boolean} [resetPlane=true] - 是否重置平面。
     * @r eturns {Boolean} 是否成功站立在平面上
     */
    const success = this.slam.standOnThePlane( this.current_model, x, y, resetPlane);
    if (success) {
      this.current_model.visible = true;
      this.current_model.playAnimation({ loop: true });
      tapback(true);
    } else { 
      wx.showToast({ title: "放置模型失败，请对准平面", icon: "none" }); 
      tapback(false);
    } 

    return true;
    if (Array.isArray(touches) && touches.length > 0) { 
      const { offsetLeft, offsetTop } = target;
      const { pageX, pageY } = touches[0];
      // 注意：需要传入在kivicube-slam组件上的坐标点，而不是页面上的坐标点。
      const success = this.slam.standOnThePlane(
        this.current_model,
        pageX - offsetLeft,
        pageY - offsetTop,
        true
      );

      if (success) {
        this.current_model_Pos =  { touches, target };
        this.current_model.visible = true;
        this.current_model.playAnimation({ loop: true }); 
        //this.slam.removePlaneIndicator();  
        return true;
      } else { 
        wx.showToast({ title: "放置模型失败，请对准平面", icon: "none" }); 
        return false;
      }
    }
    return false
  }
  
  error({ detail })
  {   
    // 判定是否camera权限问题，是则向用户申请权限。
    if (detail?.isCameraAuthDenied) {
      showAuthModal(this);
    } else {
      errorHandler(detail);
    }
  }

  onShareAppMessage() {
    return {
      title: "一带一路",
      path: "pages/scene/scene",
      imageUrl: resUrl("images/share.jpg"),
    };
  }

  geturl(url)
  {   
    return this.resource_config.baseurl+url
  }
  // 清理
  clear() {
    console.log("################clear###############");
    if(this.current_model)
    {
      this.slam.remove(this.current_model); 
      this.slam.destroyObject(this.current_model); 
    } 
    this.slam = null; 
    this.downloadAssets = null;
    this.resource_config= null;
    this.current_model  =null;
    this.reticleModel  =null;
    this.currentModelInfo =null;
    this.configPromise =null;
  }


}


export default resource_manager;
