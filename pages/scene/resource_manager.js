import { errorHandler,requestFile,showAuthModal,log} from "../../utils/utils"
//import { get_reticle,get_config}  from "../../utils/glbconfig"

class resource_manager {
  constructor() {} 
  
  getConfigData()
  { 
    var configurl = "https://yidaiyilu-s.oss-cn-shanghai.aliyuncs.com/resource/glbconfig.json";  
    this.configPromise =  requestFile(configurl,"text"); 
    var that = this;
    this.configPromise
    // .then(res =>{ 
    //   setTimeout(() => {
    //     return this.configPromise;
    //   }, 5);
    // })
    .then(res =>{ 
      that.resource_config = res;  
    });  
  }

  getResourceConfig()
  {
    return this.resource_config;//this.resource_config.modelsInfo,
  }
  /**
   * 初始化场景和模型，但此时还没有将模型加入到场景内。
   * 只能在slam组件ready后使用
   * @param {*} slam 传入的slam对象
   * @memberof Food
   */
  async initScene(slam , index=0) {  
    console.log("this.resource_config:"+this.resource_config);
    if(!this.resource_config)
    {
      this.resource_config = await this.configPromise;   
    }  
 
    try { 
      this.slam = slam;
      const [
        reticleArrayBuffer, 
        glbArrayBuffer,
      ] = await this.fristLoadSource(index); 
      
      log("initScene enner"); 
      const [reticleModel, current_model] = await Promise.all([
        slam.createGltfModel(reticleArrayBuffer),
        slam.createGltfModel(glbArrayBuffer), 
      ]);  
      
      var defaultAmbientLight = this.resource_config.light.defaultAmbientLight; 
      var defaultDirectionalLight =  this.resource_config.light.defaultDirectionalLight; 
      slam.defaultAmbientLight.intensity = defaultAmbientLight;
      slam.defaultDirectionalLight.intensity = defaultDirectionalLight;
      slam.enableShadow(); // 开启阴影功能

      log("initScene current_model geted"); 
      current_model.visible = false;  
      var modelsize = this.currentModelInfo? this.currentModelInfo.size:0.5; 
      console.log("modelsize:"+modelsize);
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
    log("fristLoadSource 1111："+ this.resource_config);  
    this.modelIndex = index; 

    this.currentModelInfo = this.resource_config.modelsInfo[index]; 
    var reticleurl = this.geturl(this.resource_config.reticle); 
    var glburl = this.geturl(this.currentModelInfo.glburl)
    log("reticleurl:"+reticleurl);
    log("config:"+glburl);

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
     
    this.slam.add(this.current_model, modelsize,0); 
     // 让模型可用手势进行操作。默认点击移动到平面上的新位置，单指旋转，双指缩放。
    this.slam.setGesture(this.current_model); 
    if(this.current_model_Pos)
    { 
      this.tap(this.current_model_Pos)
    }
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
  tap({ touches, target }) { 
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
    this.slam = null;
    this.model = null;
    this.downloadAssets = null;
  }


}


export default resource_manager;
