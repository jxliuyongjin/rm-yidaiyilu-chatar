import {requestFile} from "../../utils/utils" 
const app = getApp();
Page({ 
  data: {
    sceneId: '0b67f1deac521f34379f0cf4faef99e1',
    params: "&shadow=0.15&ambient=0.3&directional=2.5&horizontal=0&vertical=0&envMap=default&size=30&rotation=0&animation=&animationLoop=true&shareImage=&gyroscope=false", 
    shareimages:"$shareImage=https://mp-c34bf075-2376-4524-984d-4801256468f3.cdn.bspapp.com/glb/erwei.jpg",
    onloading:true,
    imageLoadednum:0,
    currentLuoTuoPosX:0,
    currentLuoTuoPosY:0,
    luotuoFangxiang:0,
    hasFinshed:0,
    animationDatas:[],
    uipath:{}
  }, 

  getConfigData()
  {  
    // var randomStr = Math.floor(Math.random() * 1000000);
    // var configurl = "https://yidaiyilu-s.oss-cn-shanghai.aliyuncs.com/config.json?version="+randomStr;  
    // this.configPromise =  requestFile(configurl,"text"); 
    // var that = this;
    // this.configPromise.then(res =>{ 
    //   that.resource_config = res;  
    //   app.globalData.resource_config = res;
    // }); 
  },
  onLoad() { 
    this.onClear(); 
    this.resource_config = app.globalData.resource_config;
    app.globalData.hasLoadIndex = true;
    //加载配置
    //this.getConfigData(); 
    wx.reportEvent("page_show", {
      "page_name": "loading"
    })
    wx.createSelectorQuery().select('.loadpath')
    .boundingClientRect(res => { 
      this.initanimation(res);  
    }).exec()
  },
  
  onClear()
  { 
    console.log("###############index onClear##################")
    this.points = null;
    this.windowV = null;
    this.animationstate = null;
    this.resource_config = null;
  },

  geturl(url)
  {   
    return this.resource_config.baseurl+url
  },
  setUIPath()
  { 
    const uipath = {
      bg:this.geturl("ui/shouye/bg.png"),
      btn1Icon:this.geturl("ui/shouye/btn1.png"),
      btn2Icon:this.geturl("ui/shouye/btn2.png"),
      btn3Icon:this.geturl("ui/shouye/btn3.png"), 
      btn4Icon:this.geturl("ui/shouye/btn4.png"),
      btn5Icon:this.geturl("ui/shouye/btn5.png"),
      btn6Icon:this.geturl("ui/shouye/btn6.png"),
      dec1Icon:this.geturl("ui/shouye/dec1.png"),
      dec2Icon:this.geturl("ui/shouye/dec2.png"),
      dec3Icon:this.geturl("ui/shouye/dec3.png"),
      dec4Icon:this.geturl("ui/shouye/dec4.png"),
      dec5Icon:this.geturl("ui/shouye/dec5.png"),
      dec6Icon:this.geturl("ui/shouye/dec6.png"),
      titleIcon:this.geturl("ui/shouye/title.png"), 
    }
    this.setData({
      uipath
    })
  },

  async onReady(){   
    // if(app.globalData.resource_config == null){ 
    //     this.resource_config = await this.configPromise;  
    //     app.globalData.resource_config = this.resource_config;   
    // } else{ 
      this.resource_config = app.globalData.resource_config;
    // } 
    var animationDatas =[];
    for(var i=0;i<6;i++)
    {
      var animation = wx.createAnimation() 
      animation.scale(0,0).step(); 
      animationDatas.push(animation.export())
    } 
    this.setData({
      animationDatas
    })   
    this.setUIPath();
  },
  
  imageLoaded(e)
  {
    var imageLoadednum = this.data.imageLoadednum+1; 
    this.setData({
      imageLoadednum
    }) 
    if(imageLoadednum<=13)
    { 
      if(this.hasInitedLoading === true){
        this.getdeltaDta(100*imageLoadednum/13); 
      }
      else{
        this.hasloadfinshed = true; 
      }
    }
  }, 
 
  gotoModel(e){
    console.log(e.target.id==1);
    var moduleindex = e.target.id
    if(moduleindex<0||moduleindex>=6)
    {
      return;
    } 
    wx.reportEvent("button_clicked", {
      "btn_name": "首页按钮-"+moduleindex
    })
    wx.navigateTo({ url: `/pages/scene/scene?moduleindex=${moduleindex}`});
   // wx.navigateTo({ url: "/pages/scene/scene"});
  },

 
  ///////////////////////////loading动画///////////////////////////////
 
  anmationFinished(res)
  {
    console.log("!!!!!!!!!!!! anmationFinished !!!!!!!!!!!!!!!!!!!!!!")
    this.resetAnimationState();
    this.setData({ 
      onloading:false, 
    })   
    wx.reportEvent("page_show", {
      "page_name": "首页"
    })
    var animationDatas =[];
    var delayT = 0;
    for(var i=0;i<6;i++)
    {
      var animation = wx.createAnimation() 
      animation.scale(1,1).step({duration: 150,delay:delayT , timingFunction:"ease"})
      .scale(0.8,0.8).step()
      .scale(1,1).step(); 
      delayT += 150;
      animationDatas.push(animation.export())
    }
   
    this.setData({
      animationDatas
    }) 
  },

  async initanimation(res)
  {
    this.windowV =  await wx.getSystemInfo(res=>res).catch(e=>{
      console.log(e);
    })

    if(this.windowV==null)
    {
      this.windowV ={
        windowWidth:750,
        windowHeigth:1334
      }
    }
   // console.log("windowV geted..."+JSON.stringify(this.windowV));  
    //console.log("res geted..."+JSON.stringify(res)); 
    this.setAnimtionPositions(res); 
     var point = this.getPoint(0); 
    // console.log("point..."+JSON.stringify(point));  
     this.setData({
      currentLuoTuoPosX:point.x,
      currentLuoTuoPosY:point.y,
     })
     
     if(this.hasloadfinshed === true)
     { 
        this.getdeltaDta(100);
     }
     else{
       this.hasInitedLoading = true; 
     } 
  },
  getPoint(index)
  { 
    return this.points[index];
  },
 
  setAnimtionPositions(pathEle)
  {
    var point0 = {x:0,y:3,rateNum:0}
    var point1 = {x:27,y:5,rateNum:9}
    var point2 = {x:85,y:20,rateNum:23}
    var point3 = {x:92,y:30.5,rateNum:27}
    var point4 = {x:65,y:43,rateNum:35}
    var point5 = {x:43,y:42,rateNum:39}
    var point6 = {x:28.5,y:45.5,rateNum:45}
    var point7 = {x:2,y:44,rateNum:50}
    var point8 = {x:0,y:52,rateNum:55}
    var point9 = {x:18,y:62,rateNum:60}
    var point10 = {x:30,y:61.5,rateNum:64}
    var point11 = {x:48,y:65,rateNum:68}
    var point12 = {x:70,y:65,rateNum:72}
    var point13 = {x:75,y:77,rateNum:82}
    var point14 = {x:65,y:86,rateNum:90}
    var point15 = {x:85,y:97,rateNum:100}
    
    this.points =[point0,point1,point2,point3,point4,point5,point6,point7,point8,point9,point10,point11,point12,point13,point14,point15]; 
    this.points.forEach(value=>{  
      value.x = (pathEle.left + 0.01*value.x*pathEle.width);// 100*(value.x+startposX)/this.windowV.windowWidth
      value.y = (pathEle.top + 0.01*value.y*pathEle.height);
    }); 
    this.resetAnimationState();
  },
  resetAnimationState(){ 
    this.animationstate={
      intervlId:0,
      isOnPlaying:false,
      cacheDes:[],
    }
    this.hasLasted = [];
    this.stepsDes = [];
    for(var i=0;i<this.points.length;i++)
    {
      this.hasLasted.push(0);
      this.stepsDes.push(null);
    } 
  },
  
  playAnimation(des)
  {
    if(des.stepindex>this.points.lenght||des.stepindex<0) {
      console.log("##################："+des.stepindex)
      return;
    } 

    if(this.animationstate.isOnPlaying === true)
    { 
      var hasdata = false;
      for(var i=0;i<this.animationstate.cacheDes.lenght;i++) {
        if(this.animationstate.cacheDes[i].stepindex === des.stepindex) {
          this.animationstate.cacheDes[i] = des;
          hasdata = true;
          break;
        }
      } 
      if(!hasdata)  { 
        //console.log("11111111111111nextDes:"+JSON.stringify(des))
        this.animationstate.cacheDes.push(des)
      } 
      return ;
    }
 
    this.animationstate.isOnPlaying = true; 
    if(this.animationstate.intervlId !== 0)
    {
      clearInterval(this.intervlId);
      this.animationstate.intervlId = 0;
    }

    var that = this;
    const totaltime = 300;
    const deltatime = 10;
    const rateTime = deltatime/totaltime;

    var tempx =  this.data.currentLuoTuoPosX;
    var tempy =  this.data.currentLuoTuoPosY;
    //console.log("tempx："+tempx+"tempy: "+tempy);
    const deltax = (des.x - tempx)*rateTime;
    const deltay = (des.y - tempy)*rateTime;  
    if(deltax<0){ 
      this.setData({
        luotuoFangxiang:180
      })
    }else if(deltax>0)
    { 
      this.setData({
        luotuoFangxiang:0
      })
    }

    var tempTime = 0;
    var that= this;
    this.intervlId = setInterval(function(){
      tempx = tempx + deltax;
      tempy = tempy + deltay;
      if((deltax>0 && tempx>des.x)||(deltax<0 && tempx<des.x)){ tempx = des.x } 
      if((deltay>0 && tempy>des.y)||(deltay<0 && tempy<des.y)){ tempy = des.y } 
      that.setData({
        currentLuoTuoPosX:tempx,
        currentLuoTuoPosY:tempy,
      }) 
      
      if(tempTime>=totaltime)
      {
        clearInterval(that.intervlId);
        that.animationstate.intervlId = 0;
        that.animationstate.isOnPlaying = false; 

        if(that.animationstate.cacheDes.length==0)
        { 
          that.anmationFinished(true);
        }
        else{ 
          var nextDes = that.animationstate.cacheDes.shift();
          that.playAnimation(nextDes);
        }
      }
      tempTime = tempTime+deltatime;
    },deltatime)
  },

  setStepsDes(index)
  { 
    //当前节点到下一个节点的距离插值
    var deltaNum = this.points[index+1].rateNum-this.points[index].rateNum;
    var delatx = (this.points[index+1].x - this.points[index].x)/deltaNum;
    var delaty = (this.points[index+1].y - this.points[index].y)/deltaNum; 
 
    this.stepsDes[index] ={
      stepindex:index,
      x:this.points[index].x,
      y:this.points[index].y, 
      delatx,
      delaty,
    }
  },

  getdeltaDta(rate)
  {  
    //console.log("getdeltaDta rate:"+rate)
    var des =null;
    for(var i=0;i<this.points.length-1;i++)
    { 
      if(rate<=this.points[i+1].rateNum)
      {  
        des = this.stepsDes[i];
        if(des===null){
          //初始化递增值 
          this.setStepsDes(i);
          des = this.stepsDes[i];
        }
        //设置当前位置y
        if(i==0)
        {
          des.x = rate*des.delatx+this.points[i].x;
          des.y = rate*des.delaty+this.points[i].y;   
        }else{
          this.gobash(i);
          des.x = (rate-this.points[i].rateNum)*des.delatx+this.points[i].x;
          des.y = (rate-this.points[i].rateNum)*des.delaty+this.points[i].y;
        }
        //是否到已经完成达过关键节点
        if(rate==this.points[i+1].rateNum){ 
          this.hasLasted[i] = 1;
        }
        //console.log("getdeltaDta rate:"+JSON.stringify(des))
        this.playAnimation(des);
        break;
      }
    } 
  },

  gobash(goStep)
  { 
    //检测一下是不是突然跳阶段，如果是跳阶段，需要把前面阶段的目标点不齐
    for(var i=0;i<goStep;i++)
    {
      var tempDes = this.stepsDes[i]; 
      //是否含有关键节点
      if((this.hasLasted[i]==0)||(tempDes == null)) { 
        this.stepsDes[i] = {stepindex:i,   x:this.points[i+1].x, y:this.points[i+1].y}
        this.hasLasted[i] = 1
        tempDes = this.stepsDes[i];
        this.playAnimation(tempDes);
      } 
    } 
  }, 

  /////////////////////////分享////////////////////////////////// 
  onShareAppMessage() {
    return {
      title: app.globalData.appName,
      path: "/pages/index/index",
      imageUrl: this.geturl("share.jpg")
    };
  },

  /**
   * 用户点击右上角盆友圈分享
   */
  onShareTimeline(){ 
    return {
      title: app.globalData.appName,
      imageUrl:this.geturl("share.jpg")
    }
  },


});
