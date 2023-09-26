import resource_manager from "./../scene/resource_manager"

Page({

    /**
     * 页面的初始数据
     */
    data: {
      icon_arrs:[{}],
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
      ////加载配置
      var icon_arrstemp = this.resource.getConfigData();
      this.setData({
        icon_arrs:icon_arrstemp, 
      }); 
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },  
    changebtn_clicked: function(event) { 
      console.log(event.currentTarget.id);
    } 
})