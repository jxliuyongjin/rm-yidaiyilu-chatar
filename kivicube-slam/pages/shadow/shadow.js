import { errorHandler, showAuthModal, requestFile } from "./../../utils/utils";

function updateMatrix(object, { transform }) {
  if (transform) {
    object.matrix.fromArray(transform);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
  }
}

Page({ 

  onLoad() { 
    wx.showLoading({ title: "初始化中...", mask: true });
    this.downloadAsset = requestFile(
      "https://yidaiyilu-s.oss-cn-shanghai.aliyuncs.com/resource/rabbit_shadow.glb"
    ); 
    this.shadowPlanes = {};
  },

  async ready({ detail: slam }) { 
    try { 
      this.slam = slam;
      const modelArrayBuffer = await this.downloadAsset;
      const model3d = await slam.createGltfModel(modelArrayBuffer);
      model3d.position.z = -1.5;
      slam.add(model3d, 0.5);

      this.current_model = model3d;

      // 开启slam平面追踪
      await slam.start();
      
      this.setmapSize(slam);
      /**
       * v2模式下, 3d对象站立在新的平面上后, 需要在新的平面上新建对应的阴影片
       * (由于v2模式下可能存在多个平面, 所以每次放置成功后, 都要确保当前模型站立的平面有可用的阴影片)
       * 
       * v1模式和陀螺仪模式只有一个平面, 不用做这个操作
       * **/
     // const intensity = 0.15; 
      // slam.setGesture(model3d, {
      //   clickResult: (result) => { 
      //     if (result && slam.isSlamV2()) { 
      //       this.setShadowPlane(result.plane, intensity);
      //       console.log("###### 55555555555555555 ")
      //     }
      //   },
      // });

      // const { windowWidth, windowHeight } = wx.getSystemInfoSync();
      // const result = slam.standOnThePlane(
      //   model3d,
      //   Math.round(windowWidth / 2),
      //   Math.round(windowHeight / 2),
      //   true,
      // );
  
      // model3d.playAnimation({ loop: true });
 
      // if (result) {
      //   if (slam.isGyroscope()) { 
      //     // 陀螺仪模式建议用这个方式创建阴影
      //     console.log("@@@@@@@@@@@@ isGyroscope @@@@@@@@@@@@@@")
      //     slam.enableShadow(intensity);
      //   } else {
      //     console.log("@@@@@@@@@@@@ setShadowPlane @@@@@@@@@@@@@@")
      //     // result.plane 是模型被放置到的平面对象，插件版本 >= 1.3.19 后支持
      //     this.setShadowPlane(result.plane, intensity);
      //   }
      // } 
      /**
       * 开启模型投射阴影属性。
       * @param {Boolean} cast - 是否投射。true为开启投射，false为关闭投射。
       * @param {Boolean} [recursive=true] - 是否递归设置所有子对象。默认为true。模型对象建议为true，否则阴影会不完整。
       */
      model3d.setCastShadow(true);
      this.setDirectionalLightAngle();

      wx.hideLoading();

      console.log("当前是否为陀螺仪追踪：", slam.isGyroscope());
      console.log("当前slam版本是否为v2：", slam.isSlamV2());
      console.log("当前slam版本是否为v1：", slam.isSlamV1());
    } catch (e) {
      wx.hideLoading();
      errorHandler(e);
    }
  },
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
  },

  tap() {   
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
    const success = this.slam.standOnThePlane( this.current_model, x, y, resetPlane);
    if (success) { 
      const intensity = 0.15; 
      this.current_model.visible = true;
      this.current_model.playAnimation({ loop: true });  
      if (this.slam.isGyroscope()) { 
        // 陀螺仪模式建议用这个方式创建阴影 
        this.slam.enableShadow(intensity);
      } else { 
        // result.plane 是模型被放置到的平面对象，插件版本 >= 1.3.19 后支持
        this.setShadowPlane(success.plane, intensity);
      }

      this.current_model.setCastShadow(true);
      this.setDirectionalLightAngle();

    } else { 
      wx.showToast({ title: "放置模型失败，请对准平面", icon: "none" });  
    } 

    return true; 
  },

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
  },
 
	setDirectionalLightAngle() {
    const directionalLight = this.slam.defaultDirectionalLight;
    const directionalPosition = directionalLight.position.clone().set(0, 1, 0);
		const axisX = directionalPosition.clone().set(1, 0, 0);
    const	axisY = directionalPosition.clone();

    console.log(axisX, axisY)
    
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
	},


  error({ detail }) {
    wx.hideLoading();
    // 判定是否camera权限问题，是则向用户申请权限。
    if (detail?.isCameraAuthDenied) {
      showAuthModal(this);
    } else {
      errorHandler(detail);
    }
  },
});
