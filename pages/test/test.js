import { getMeiYan } from "../../signature";

Page({
  click() {
    var that = this
    wx.chooseImage({
        success({ tempFilePaths }) {
          getMeiYan(tempFilePaths[0],that.meiyanResult)
        }
      });
  },
  meiyanResult(beauty_url,code=0)
  {
    if(code==0)
    {
      console.log("beauty_url#########:"+beauty_url) 
    }
  }
})
