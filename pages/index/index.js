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
  }, 

  onLoad() {   
    this.initanimation();  
    var point = this.getPoint(0); 
    this.setData({
      imageLoadednum:0,
      onloading:true,
      currentLuoTuoPosX:point.x,
      currentLuoTuoPosY:point.y,
    })  
     
    //this.getdeltaDta(100*9/13);
  },
  
  onReady(){ 
  },

  onShareAppMessage() {
    return {
      title: app.globalData.appName,
      path: this.data.sharePagePath,
      imageUrl: app.globalData.shareImg,
    };
  },

  imageLoaded(e)
  {
    var imageLoadednum = this.data.imageLoadednum+1; 
    this.setData({
      imageLoadednum
    }) 
    if(imageLoadednum<=13)
    {
      this.getdeltaDta(100*imageLoadednum/13);
    }
  },

  setLuoTuoPos(rate)
  { 
    //this.animation.getdeltaDta(rate);
  },
 
  gotoModel(e){
    console.log(e.target.id==1);
    var moduleindex = e.target.id
    if(moduleindex<0||moduleindex>=6)
    {
      return;
    }
    wx.navigateTo({ url: `/pages/scene/scene?moduleindex=${moduleindex}`});
  },

 
  ///////////////////////////loading动画///////////////////////////////
 
  anmationFinished(res)
  {
    this.resetAnimationState();
    this.setData({ 
      onloading:false, 
    })  
    console.log("!!!!!!!!!!!! anmationFinished !!!!!!!!!!!!!!!!!!!!!!")
  },

  initanimation()
  {
    this.setAnimtionPositions(); 
  },
  getPoint(index)
  { 
    return this.points[index];
  },

  setAnimtionPositions()
  {
    var point0 = {x:8.93,y:16.94}
    var point1 = {x:50,y:22}
    var point2 = {x:85,y:32}
    var point3 = {x:42,y:38}
    var point4 = {x:22,y:45}
    var point5 = {x:47,y:47}
    var point6 = {x:75,y:52}
    var point7 = {x:80,y:61}
    
    this.points =[point0,point1,point2,point3,point4,point5,point6,point7]  
    this.animationstate={
      intervlId:0,
      isOnPlaying:false,
      cacheDes:[],
    }
    this.hasLasted=[0,0,0,0,0,0,0,0]; 
    this.stepsDes=[null,null,null,null,null,null,null,null]; 
    this.destNum = [20,40,58,68,78,90,100]; 
  },
  resetAnimationState(){
    this.animationstate={
      intervlId:0,
      isOnPlaying:false,
      cacheDes:[],
    }
    this.hasLasted=[0,0,0,0,0,0,0,0]; 
    this.stepsDes=[null,null,null,null,null,null,null,null]; 
    this.destNum = [20,40,58,68,78,90,100]; 
  },
  
  playAnimation(des)
  {
    if(des.stepindex>6||des.stepindex<0) {
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
        console.log("11111111111111nextDes:"+JSON.stringify(des))
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
    console.log("tempx："+tempx+"tempy: "+tempy);
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

  setStepsDes(index,deltaNum)
  { 
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
    console.log("getdeltaDta rate:"+rate)
    var des =null;
    for(var i=0;i<this.destNum.length;i++)
    { 
      if(rate<=this.destNum[i])
      { 
        console.log("rate i:"+i)
        des = this.stepsDes[i];
        if(des===null){
          //初始化递增值
          if(i==0){ 
            this.setStepsDes(i,this.destNum[i]);
          }else{ 
            this.setStepsDes(i,this.destNum[i]-this.destNum[i-1]);
          }
          des = this.stepsDes[i];
        }
        //设置当前位置y
        if(i==0)
        {
          des.x = rate*des.delatx+this.points[i].x;
          des.y = rate*des.delaty+this.points[i].y;   
        }else{
          this.gobash(i);
          des.x = (rate-this.destNum[i-1])*des.delatx+this.points[i].x;
          des.y = (rate-this.destNum[i-1])*des.delaty+this.points[i].y; 
        }
        //是否到达过关键节点
        if(rate==this.destNum[i]){ 
          this.hasLasted[i] = 1;
        }
        console.log("getdeltaDta rate:"+JSON.stringify(des))
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
  }
});
