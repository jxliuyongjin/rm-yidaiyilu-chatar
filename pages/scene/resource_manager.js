import { errorHandler,requestFile,showAuthModal} from "../../utils/utils"; 

class resource_manager {
  constructor() {} 
  /**
   * 下载场景必要素材
   * @return Promise
   * @memberof Food
   */
  loadAssets() {  
    if (this.downloadAssets) {
      return this.downloadAssets;
    }  
    wx.showLoading({ title: "初始化中...", mask: true });
    this.downloadAssets = Promise.all([
      requestFile("https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/reticle.glb"), 
      requestFile("https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/rabbit.glb")
    ]).then((res) => {
      return res;
    }); 
    return this.downloadAssets;
  }

  /**
   * 初始化场景和模型，但此时还没有将模型加入到场景内。
   * 只能在slam组件ready后使用
   * @param {*} slam 传入的slam对象
   * @memberof Food
   */
  async initScene({ detail: slam }) {   
    try {
      this.slam = slam;
      const [
        reticleArrayBuffer, 
        rabbitArrayBuffer,
      ] = await this.downloadAssets; 

      const [reticleModel, rabbitModel] = await Promise.all([
        slam.createGltfModel(reticleArrayBuffer),
        slam.createGltfModel(rabbitArrayBuffer), 
      ]); 
      
      slam.enableShadow(); // 开启阴影功能
      rabbitModel.visible = false;
      slam.add(rabbitModel, 0.5);

      this.reticleModel = reticleModel;
      this.rabbitModel = rabbitModel;   

      this.findPlane();
      await slam.start();  
      wx.hideLoading();
      return true;
    } catch (e) { 
      wx.hideLoading();
      errorHandler(e);
      return false;
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
        this.rabbitModel,
        pageX - offsetLeft,
        pageY - offsetTop,
        true
      );

      if (success) {
        this.rabbitModel.visible = true;
        this.rabbitModel.playAnimation({ loop: true }); 
        this.slam.removePlaneIndicator(); 
        
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
    wx.hideLoading();
    // 判定是否camera权限问题，是则向用户申请权限。
    if (detail?.isCameraAuthDenied) {
      showAuthModal(this);
    } else {
      errorHandler(detail);
    }
  }

  // 清理
  clear() {
    this.slam = null;
    this.model = null;
    this.downloadAssets = null;
  }
}

export default resource_manager;
