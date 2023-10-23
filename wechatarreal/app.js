
import { getInfo } from "./utils/configsetd";
App({ 
  onLaunch() { 
    this.globalData = {
      currentSenceId:0,
      hasLoadIndex:false,
      resource_config:getInfo(), 
      appName: "AR丝路之旅",
      uMengClickedEventId: "Um_Event_ModularClick",
      uMengPageArived:"Um_Event_PageView"
    } 

    var modelsInfo =  this.globalData.resource_config.modelsInfo; 
    var value = null;
    for(var i=0;i<modelsInfo.length;i++)
    {
      value = modelsInfo[i];
      value.iconurl = this.globalData.resource_config.baseurl + value.iconurl; //this.resource.geturl(value.iconurl);  
    }
    this.globalData.currentSenceId = wx.getLaunchOptionsSync().scene;
  },
});
