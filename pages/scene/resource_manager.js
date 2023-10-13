import { errorHandler,requestFile,showAuthModal,log} from "../../utils/utils" 

const app = getApp();
function updateMatrix(object, { transform }) {
  if (transform) {
    object.matrix.fromArray(transform);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
  }
}
class resource_manager {
  constructor() {}  
  getModelsInfo()
  {
    return this.resource_config.modelsInfo;
  }

  onload(index)
  {  
    this.clear();
    this.resource_config = app.globalData.resource_config;     
    this.currentModelInfo = this.resource_config.modelsInfo[index];   
    var reticleurl = this.geturl(this.resource_config.reticle); 
    var glburl = this.geturl(this.currentModelInfo.glburl);   
    wx.reportEvent("model_showing", {
      "model_name":this.currentModelInfo.modelName
    }) 
    this.downloadAssets = Promise.all([
      requestFile(reticleurl), 
      requestFile(glburl)
    ]).then((res) => { 
      return res;
    });  
  }
  /**
   * 初始化场景和模型，但此时还没有将模型加入到场景内。
   * 只能在slam组件ready后使用
   * @param {*} slam 传入的slam对象
   * @memberof Food
   */
  async initScene(slam , index=0) {   
    try { 
      this.slam = slam; 
      this.modelIndex = index;  
    
      const [
        reticleArrayBuffer, 
        glbArrayBuffer,
      ] = await this.downloadAssets; 
      this.downloadAssets = null;  
      log("initScene inner");
      
      const [reticleModel, current_model] = await Promise.all([
        slam.createGltfModel(reticleArrayBuffer),
        slam.createGltfModel(glbArrayBuffer), 
      ]);   
      this.shadowPlanes = [];
      //slam.enableShadow(); // 开启阴影功能 
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
      this.setVisibleReticleMode(false);  
      await slam.start();  
      this.setmapSize(slam);
      return true;
    } catch (e) { 
      return false;
    }
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
      this.current_model = null;
    } 

    this.currentModelInfo = this.resource_config.modelsInfo[index];  
    
    wx.reportEvent("model_showing", {
      "model_name":this.currentModelInfo.modelName
    })
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
    if(this.hasaddReticle === true) {
      this.setVisibleReticleMode(true);
      return 
    } 
    const { slam ,reticleModel} = this;  
    var that = this;
    this.hasaddReticle = true;
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
        that.setVisibleReticleMode(true);
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
    // 首次调用standOnThePlane，resetPlane参数必须设为true，以便确定一个平面。
    // 如果为false，代表使用已经检测到的平面。默认为true。
    var resetPlane =true;
    if(this.notFristset === true){
      resetPlane = false;
    }
    this.notFristset = true;
    /**
     *  主动让模型站在屏幕中心映射到平面上的位置点。 
     * 让3D素材对象，站立在检测出来的平面之上。
     * @param {Base3D} base3D - 3D对象
     * @param {Number} x - kivicube-slam组件上的x轴横向坐标点
     * @param {Number} y - kivicube-slam组件上的y轴纵向坐标点
     * @param {Boolean} [resetPlane=true] - 是否重置平面。
     * @r eturns {Boolean} 是否成功站立在平面上
     */
    const success = this.slam.standOnThePlane( this.current_model, Math.round(windowWidth / 2), Math.round(windowHeight / 2), resetPlane);
    if (success) {
      const intensity = 0.15; 
      this.current_model.visible = true;
      this.current_model.playAnimation({ loop: true });
      if (this.slam.isGyroscope()) { 
        // 陀螺仪模式建议用这个方式创建阴影 
        this.slam.enableShadow(intensity);
      } else { 
        // result.plane 是模型被放置到的平面对象
        this.setShadowPlane(success.plane, intensity);
      }
      this.current_model.setCastShadow(true);
      this.setDirectionalLightAngle();
      tapback(true);
    } else { 
      wx.showToast({ title: "放置模型失败，请对准平面", icon: "none" }); 
      tapback(false);
    }  
  }
  
  error({ detail })
  {   
    // 判定是否camera权限问题，是则向用户申请权限。
    if (detail?.isCameraAuthDenied) {
      showAuthModal(this);
    } else {
      errorHandler({ detail });
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

  gethaibaourl(url)
  {
    return this.resource_config.baibaourl+url
  }

  setmapSize(slam)
  { 
      // 设置阴影的分辨率, 注意：分辨率越高性能消耗越大，另外请设置分辨率为2的幂次方
      slam.defaultDirectionalLight.shadow.mapSize.width = 1024;
      slam.defaultDirectionalLight.shadow.mapSize.height = 1024;

      if (slam.isSlamV2()) {
        slam.defaultDirectionalLight.shadow.mapSize.width = 2048;
        slam.defaultDirectionalLight.shadow.mapSize.height = 2048;
        // v2模式下缩小平行光的覆盖范围，产生阴影的区域对应减小, 阴影贴图覆盖在更小的区域上, 阴影效果更好(可以理解为单位面积的阴影贴图分辨率更高)
        // 默认值为5 这里把范围改小些
        slam.defaultDirectionalLight.shadow.camera.left = -2;
        slam.defaultDirectionalLight.shadow.camera.right = 2;
        slam.defaultDirectionalLight.shadow.camera.top = 2;
        slam.defaultDirectionalLight.shadow.camera.bottom = -2;
      } 
  }
  /**
   * 根据传入的平面信息，放置阴影面片
   */
  setShadowPlane(plane, opacity) {
    if (!plane) return;
    const { slam } = this;

    if (this.currentPlaneId === plane.id) return;
    this.currentPlaneId = plane.id;

    /**
     * 注意：此API需要插件版本 >= 1.3.19
     * 
     * 创建一个阴影面片对象，设置阴影面片的大小和阴影强度。
     * @param {Number} [width] - 阴影片的宽度(阴影片贴在平面后的长度)
     * @param {Number} [height] - 阴影片的高度(阴影片贴在平面后的宽度)
     * @param {Number} [shadowIntensity=0.15] - 阴影强度。默认值为0.15。值范围为0-1，0为无效果，1为最强。
     */
    const shadowPlane = slam.createShadowPlane(100, 100, opacity);
    // 创建阴影面片后，开启阴影投射
    slam.startShadow();

    // 关闭阴影投射
    // slam.stopShadow();

    // 更新阴影面片的矩阵信息
    updateMatrix(shadowPlane, plane);

    /**
     * 阴影面片默认是紧贴在模型放置的平面上，为了避免面片与模型极度紧贴可能导致的显示异常
     * 这里需要把阴影面片的y轴位置向下调整，这里的数值仅作参考
     */
    if (slam.isSlamV2()) {
      shadowPlane.position.y -= 0.003;
    } else {
      shadowPlane.position.y -= 0.05;
    }

    this.shadowPlanes[plane.id] = shadowPlane;
    slam.add(shadowPlane);

    /**
     * 只显示站立在当前平面id上的阴影片
     * **/
    Object.entries(this.shadowPlanes).forEach(
      ([planeId, plane]) => (plane.visible = planeId === this.currentPlaneId)
    );
  }
 
	setDirectionalLightAngle() {
    const directionalLight = this.slam.defaultDirectionalLight;
    const directionalPosition = directionalLight.position.clone().set(0, 1, 0);
		const axisX = directionalPosition.clone().set(1, 0, 0);
    const	axisY = directionalPosition.clone(); 
    //console.log(axisX, axisY)
    
    const horizontalRadius = Math.PI / 180 * 45;
    const verticalRadius = Math.PI / 180 * 45;

    directionalPosition.applyAxisAngle(
			axisX,
      verticalRadius,
    );

    directionalPosition.applyAxisAngle(
      axisY,
      horizontalRadius
    );

    const position = directionalPosition.clone();
    directionalLight.position.copy(position);
    directionalLight.target.position.copy(this.current_model.position);
	} 

  // 清理
  clear() {
    console.log("################clear###############");
    if(this.current_model)
    {
      this.slam.remove(this.current_model); 
      this.slam.destroyObject(this.current_model); 
    } 
    if(this.shadowPlanes) {
      this.shadowPlanes.forEach(value=>{
        this.slam.remove(value); 
        this.slam.destroyObject(value); 
      })
    }
    this.current_model  =null;
    this.reticleModel  =null;
    this.currentModelInfo =null;
    this.configPromise =null; 
    this.resource_config= null;
    this.downloadAssets = null;
    this.shadowPlanes = null; 
    this.slam = null; 
  }


}


export default resource_manager;
