var config = {
  baseurl:"https://yidaiyilu-s.oss-cn-shanghai.aliyuncs.com/resource/",
  reticle:"reticle.glb",
  light:{
      defaultAmbientLight:"0.82",    
      defaultDirectionalLight:"2.5",
  },
  modelsInfo:[
      {
      model_idnex:0,
      glburl:"model/shenmiao_ganlanshu_hepingge.glb", 
      iconurl:"ui/content/1.png", 
      size:5.01580
      }, 
      { 
      model_idnex:1,
      glburl:"model/baochuan.glb", 
      iconurl:"ui/content/2.png",
      size:6.50029
      }, 
      { 
      model_idnex:2,
      glburl:"model/chelizhi_huolieniao.glb", 
      iconurl:"ui/content/3.png",
      size:7.50704
      }, 
      { 
      model_idnex:3,
      glburl:"model/banma_feizhou.glb", 
      iconurl:"ui/content/4.png",
      size:33.54697
      }, 
      { 
      model_idnex:4,
      glburl:"model/shamo_luotuo.glb", 
      iconurl:"ui/content/5.png",
      size:6.82142
      }, 
      { 
      model_idnex:5,
      glburl:"model/tielu.glb", 
      iconurl:"ui/content/6.png",
      size:15.43312
      }
  ]
}

export function getInfoJson()
{
    const jsonstr = JSON.stringify(config);
    console.log(jsonstr);
}