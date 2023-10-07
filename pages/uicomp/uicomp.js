import {getInfoJson} from "./../../utils/configsetd"
import {log,requestFile} from "./../../utils/utils" 
Page({

    /**
     * 页面的初始数据
     */
    data: {
      icon_arrs:[{}],
      photoPath:"",
      haibaoPhotoPath:"",
      moduleindex:1,
      iconNames:["icon0","icon1","icon2","icon3","icon4","icon5","icon6"],
      iconScrollPos:0,
      modelIcons:[],
      toView:"0",
      maskvisible:[0,1,1,1,1,1]
    },
    scrollToView: function () {
      
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      getInfoJson(); 
    },
 
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() { 
      
    },
    
    //绘制海报
  async drawHaiBao(res)
  { 
    var canvas = res.node
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
        bgImage.src = this.data.uiIconsPath.photoBgIcon // 要加载的图片 url
      }) 
      canvasContext.drawImage(bgImage, 0, 0, canvas_width, canvas_height);  
       
      var imageHW = 1.8
      const imageWidth = canvas_width*0.73;
      const imageHeight = imageHW*imageWidth; 
      const imageLeft = (canvas_width -  imageWidth)*0.5;
      const imageTop = canvas_height*0.105;

      const kuangwidth = imageWidth + canvas_width*0.06;
      const kuangHeight = imageHeight + canvas_width*0.04;
      const kuangLeft = imageLeft - canvas_width*0.0133;
      const kuangTop= imageTop-canvas_width*0.008; 

      // 创建一个图片
      const image = canvas.createImage() 
      // 把图片画到 canvas 上 
      // 等待图片加载
      await new Promise(resolve => {
        image.onload = resolve
        image.src =  this.data.photoPath;// 要加载的图片 url
      }) 
      canvasContext.drawImage(image, imageLeft, imageTop, imageWidth, imageHeight);  
        //绘制框
      const kuangImage = canvas.createImage() 
      await new Promise(resolve => {
        kuangImage.onload = resolve
        kuangImage.src = this.data.uiIconsPath.kuangIcon // 要加载的图片 url
      }) 
      canvasContext.drawImage(kuangImage, kuangLeft, kuangTop, kuangwidth, kuangHeight);  
      
      var tht = this; 
      const erweiWidth = canvas_width*0.214;
      const erweiHeight = erweiWidth;
      const kuangfloot =  kuangTop + kuangHeight;
      const erweitop = kuangfloot+(canvas_height -kuangfloot-erweiHeight)*0.4;
      const erweiLeft = canvas_width*0.2002;
      
      //绘制二维码
      const erweimaImage = canvas.createImage() 
      await new Promise(resolve => {
        erweimaImage.onload = resolve
        erweimaImage.src =this.data.uiIconsPath.erweimaIcon// 要加载的图片 url
      }) 
      canvasContext.drawImage(erweimaImage, erweiLeft, erweitop, erweiWidth, erweiHeight);  
       
      const textWidth = canvas_width*0.20472;
      const textLeft =  canvas_width*0.61;
      const texttop = erweitop+canvas_width*0.121333;
      const textHeight =  textWidth*0.45206;
      //绘制文本
      const textmaImage = canvas.createImage() 
      await new Promise(resolve => {
        textmaImage.onload = resolve
        textmaImage.src = this.data.uiIconsPath.textfIcon// 要加载的图片 url
      }) 
      canvasContext.drawImage(textmaImage, textLeft, texttop, textWidth, textHeight);  

      this.getTempImage(canvas).then(res=>{  
          tht.setData({
            //haibaoPhotoPathErweima:res.tempFilePath
            haibaoPhotoPath:res.tempFilePath
          })  
          log("this.data.haibaoPhotoPathErweima:"+tht.data.haibaoPhotoPath);  
          wx.hideLoading();
      })
      .catch(err=>{ 
          wx.hideLoading();
          wx.showToast({ title: "生成照片失败"}); 
          log(err)
      }) 
    }
    catch(err) {
      console.log(err); 
    }
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

    changebtn_clicked:function(event) { 
      console.log(typeof(event.currentTarget.id));
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