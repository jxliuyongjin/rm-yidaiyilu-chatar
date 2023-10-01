import resource_manager from "./../scene/resource_manager"
import {getInfoJson} from "./../../utils/configsetd"
import {log} from "./../../utils/utils"

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
      // this.resource = new  resource_manager();
      // getInfoJson();
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

    take_photo(){
      const query = wx.createSelectorQuery()
      query.select('#showhaibao_canvas')
      .fields({ node: true, size: true })
      .exec((res) => {  
        this.drawHaiBao(res[0])    
      })
    },
    //绘制海报
    async drawHaiBao(res)
    { 
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
        canvasContext.clearRect(0, 0, canvas_width, canvas_height);   
       
        //绘制背景
        const bgImage = canvas.createImage() 
        await new Promise(resolve => {
          bgImage.onload = resolve
          bgImage.src = "/assets/images/drawphoto/bg.png" // 要加载的图片 url
        }) 
        canvasContext.drawImage(bgImage, 0, 0, canvas_width, canvas_height);  
        
        const rateHW = canvas_height/canvas_width; 

        const imageWidth = canvas_width*0.5667;
        const imageHeight = rateHW*imageWidth; 

        const kuangwidth = canvas_width*0.59467;
        const kuangHeight = imageHeight+canvas_width*0.0266;
        const kuangLeft = (canvas_width-kuangwidth)*0.5;
        const kuangTop= (canvas_height-kuangHeight)*0.3;


        const imageLeft = kuangLeft +  canvas_width*0.00667;
        const imageTop= kuangTop +  canvas_width*0.00933;  

        // 创建一个图片
        const image = canvas.createImage() 
        // 把图片画到 canvas 上 
        // 等待图片加载
        await new Promise(resolve => {
          image.onload = resolve
          image.src =  "/assets/images/drawphoto/share.jpeg";// 要加载的图片 url
        }) 
        canvasContext.drawImage(image, imageLeft, imageTop, imageWidth, imageHeight); 

         //绘制框
        const kuangImage = canvas.createImage() 
        await new Promise(resolve => {
          kuangImage.onload = resolve
          kuangImage.src = "/assets/images/drawphoto/kuang.png" // 要加载的图片 url
        }) 
        canvasContext.drawImage(kuangImage, kuangLeft, kuangTop, kuangwidth, kuangHeight);  
        
        const erweitop = canvas_height*0.7916;
        const erweiLeft = imageLeft;
        const erweiWidth = canvas_width*0.214;
        const erweiHeight = erweiWidth;
        //绘制框
        const erweimaImage = canvas.createImage() 
        await new Promise(resolve => {
          erweimaImage.onload = resolve
          erweimaImage.src = "/assets/images/drawphoto/erweima.png" // 要加载的图片 url
        }) 
        canvasContext.drawImage(erweimaImage, erweiLeft, erweitop, erweiWidth, erweiHeight);  
        
        const textWidth = canvas_width*0.20472;
        const textLeft = imageLeft+imageWidth-textWidth;
        const texttop = erweitop+canvas_width*0.121333;
        const textHeight =  textWidth*0.45206;
        //绘制框
        const textmaImage = canvas.createImage() 
        await new Promise(resolve => {
          textmaImage.onload = resolve
          textmaImage.src = "/assets/images/drawphoto/textf.png" // 要加载的图片 url
        }) 
        canvasContext.drawImage(textmaImage, textLeft, texttop, textWidth, textHeight);  

        // canvasContext.drawImage(image,offwidth, offheight, canvas_width-offwidth*2, canvas_height-offheight*2); 
        //this.getTempImage(canvas)
        //this.hideLoading(-1);  
      }
      catch(err) {
        console.log(err); 
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
  })