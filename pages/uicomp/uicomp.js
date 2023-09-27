import resource_manager from "./../scene/resource_manager"

Page({

    /**
     * 页面的初始数据
     */
    data: {
      icon_arrs:[{}],
      photoPath:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
      this.resource = new  resource_manager();
      ////加载配置
      var icon_arrstemp = this.resource.getConfigData();
      this.setData({
        icon_arrs:icon_arrstemp, 
      }); 
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },
  

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },  
    changebtn_clicked: function(event) { 
      console.log(event.currentTarget.id);
    },

    async take_photo() {
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
          photoPath,
        })
      } catch (e) {
        wx.hideLoading();
        console.error(e);
        errorHandler(`拍照失败 - ${e.message}`);
      }
    },

  save_photo()
  { 
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success() {
        wx.hideLoading();
        wx.showToast({ title: "保存照片成功", icon: "success" });
      },
      fail(e) {
        wx.hideLoading();
        console.error(e);
        wx.showToast({ title: "保存照片失败", icon: "error" });
      }
    })
  }
})