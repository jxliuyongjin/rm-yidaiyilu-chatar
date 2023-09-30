import resource_manager from "./../scene/resource_manager"
import {getInfoJson} from "./../../utils/configsetd"

Page({

    /**
     * 页面的初始数据
     */
    data: {
      icon_arrs:[{}],
      photoPath:"",
      haibaoPhotoPath:""
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
      getInfoJson();
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
  },

  onContentTap() {
    console.log("onContentTap"); 
    const query = this.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        var res = res[0];  
        const canvas = res.node 
        console.log(canvas);
        this.getcontext(canvas);
      })
  },
  
  async getcontext(canvas){
    // 创建离屏 2D canvas 实例 
    // 获取 context。注意这里必须要与创建时的 type 一致
    const context = canvas.getContext('2d')  
    // 创建一个图片
    const image = canvas.createImage() 
    // 把图片画到 canvas 上
    const canvas_width = canvas.width;
    const canvas_height = canvas.height;
    context.clearRect(0, 0, canvas_width, canvas_height); 
    // 等待图片加载 
    // 等待图片加载
     await new Promise(resolve => {
      image.onload = resolve
      image.src = "https://mp-e8796ec3-aff9-43f7-aadd-cab8776c6fd0.cdn.bspapp.com/changebtn/1.png" // 要加载的图片 url
    })  

    // 再创建一个图片
    const erweiImage = canvas.createImage() 
    await new Promise(resolve => {
      erweiImage.onload = resolve
      erweiImage.src = "https://mp-e8796ec3-aff9-43f7-aadd-cab8776c6fd0.cdn.bspapp.com/changebtn/2.png" // 要加载的图片 url
    }) 
    
    const offwidth = canvas_width*0.04;
    const offheight = canvas_height*0.04;
    context.drawImage(erweiImage, 0, 0, canvas_width, canvas_height);
    context.drawImage(image,offwidth, offheight, canvas_width-offwidth*2, canvas_height-offheight*2); 
    //this.size1todo(canvas); 
    this.getTempImage(canvas)
  }, 

  //创建canvas绘制的零时图片
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
        //this.resource.setVisibleReticleMode(true);
        wx.hideLoading();
        that.setData({
          haibaoPhotoPath:res.tempFilePath
        })  
        console.log(this.data.haibaoPhotoPath);
      },
      fail:err=>{
        //this.resource.setVisibleReticleMode(true);
        wx.hideLoading();
        console.log(err)
        wx.showToast({ title: "生成照片失败"}); 
      } 
    })   
  },
  async size1todo(canvas){  
    //把canvas转成bas64 
    let imagebase = canvas.toDataURL(); 
    let imageurl = await base64src(imagebase); 
    this.setData({
      imageurl
    })  
  },
})