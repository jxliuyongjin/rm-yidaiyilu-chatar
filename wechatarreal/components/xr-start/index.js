// components/xr-start/index.js
import MinaTouch from './touchs'; //引入mina-touch

Component({ 
  /**
   * 组件的属性列表
   */
  properties: {
    reticleUrlP:{
      type:String,
      observer: function (newVal, oldVal){
        console.log("reticleUrl:"+newVal) 
        this.setData({
          reticleUrl:newVal
        });
      }
    },
    moduleUrlP:{ 
      type:String,
      observer: function (newVal, oldVal){
        console.log("moduleUrl:"+newVal)
        this.setData({
          moduleUrl:newVal
        });
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    reticleUrl:null,
    moduleUrl:null,
    avatarTextureId: 'white',  
    modelScale:"0.1 0.1 0.1",
    modelRoate:"0 180 0"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleAssetsLoaded: function({detail}) {   
      var that = this;
      this.angle = 180;
      that.scaledes = 0.1;
      var touch = new MinaTouch({
        touchMove: function () {
          that.setData({
            modelRoate:"0 "+that.angle+" 0",
            modelScale:that.scaledes +" "+that.scaledes+" "+that.scaledes,
          });
        },
        rotate: function (evt) {
          //evt.angle代表两个手指旋转的角度   
          that.angle = that.angle + evt.angle; 
        },
        //会创建this.touch1指向实例对象  
        pinch: function (evt) {
          //evt.zoom代表两个手指缩放的比例(多次缩放的累计值),evt.singleZoom代表单次回调中两个手指缩放的比例 
          that.scaledes = evt.zoom*0.1; 
        }, 
      });
      this.scene.event.add('touchstart', (event) => {
        this.scene.ar.placeHere('setitem', true); 
        touch.start(event)
      });
       this.scene.event.add('touchmove', (event) => { 
          touch.move(event)
      });
      this.scene.event.add('touchend', (event) => { 
         touch.end(event)
     });
      
     var myEventDetail = {} // detail对象，提供给事件监听函数
     var myEventOption = {} // 触发事件的选项
     this.triggerEvent('ready', myEventDetail, myEventOption)
    },
    handleReady: function ({detail}) {
      this.scene = detail.value; 
    }, 

    modleLoaded: function({detail}) {
      console.log("modleLoaded:"+JSON.stringify(detail));
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('modelLoaded', myEventDetail, myEventOption)
    }
  }

})