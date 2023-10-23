var config = {
  baseurl:"https://yidaiyilu-quanguo.oss-cn-beijing.aliyuncs.com/resourcee-1015/",
  reticle:"reticle.glb", 
  baibaourl:"https://yidaiyilu-baijin-buchong.oss-cn-beijing.aliyuncs.com/drawphoto-1015/", 
  modelsInfo:[ 
      { 
      model_idnex:0,
      modelName:"骆驼",
      glburl:"model/shamo_luotuo.glb", 
      iconurl:"ui/content/8.png",
      defaultAmbientLight:"4",    
      defaultDirectionalLight:"0",
      size:1
      },
      {
      model_idnex:1,
      modelName:"九色鹿",
      glburl:"model/jiuselu.glb", 
      iconurl:"ui/content/1.png",
      defaultAmbientLight:"3.4",    
      defaultDirectionalLight:"0",
      size:1
      }, 
      { 
      model_idnex:2,
      modelName:"宝船",
      glburl:"model/baochuan.glb", 
      iconurl:"ui/content/4.png",
      defaultAmbientLight:"2",    
      defaultDirectionalLight:"0",
      size:1
      }, 
      { 
      model_idnex:3,
      modelName:"郁金香热气球",
      glburl:"model/yujingxiang.glb", 
      iconurl:"ui/content/3.png",
      defaultAmbientLight:"3.5",    
      defaultDirectionalLight:"0",
      size:1
      },
      { 
      model_idnex:4,
      modelName:"长颈鹿",
      glburl:"model/changjinglu.glb", 
      iconurl:"ui/content/7.png",
      defaultAmbientLight:"1.5",    
      defaultDirectionalLight:"0",
      size:3
      },
      { 
      model_idnex:5,
      modelName:"火烈鸟",
      glburl:"model/chelizhi_huolieniao.glb", 
      iconurl:"ui/content/2.png",
      defaultAmbientLight:"3",    
      defaultDirectionalLight:"0",
      size:3
      } 
  ]
}
export function getURL(url)
{ 
  return config.baseurl+url
}

export function getNoPURL(url)
{ 
  return config.baibaourl+url
}

export function getInfo()
{
  return config;
}
export function getInfoJson()
{
    const jsonstr = JSON.stringify(config);
    console.log(jsonstr);
}