import'./node_modules/umtrack-wx/lib/index';
const {
  setBackPagePath,
  setAuthorize,
  setMenuButtonBoundingClientRect, 
  setShareInfo,
} = requirePlugin("kivicube-slam");
App({
  umengConfig:{
      appKey:'6522259eb2f6fa00ba5ee2f8',//由友盟分配的APP_KEY
      useOpenid:true,// 是否使用openid进行统计，此项为false时将使用友盟+随机ID进行用户统计。使用openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用OpenID。
      autoGetOpenid:true,// 是否需要通过友盟后台获取openid，如若需要，请到友盟后台设置appId及secret
      debug:true,//是否打开调试模式
      uploadUserInfo:true// 上传用户信息，上传后可以查看有头像的用户分享信息，同时在查看用户画像时，公域画像的准确性会提升。
  },
  onLaunch() { 
    let shareImg = "https://kivicube-resource.kivisense.com/slam-ar/share.jpeg";
    this.globalData = {
      shareImg,
      appName: "送你一次环球之旅",
      uMengClickedEventId: "Um_Event_ModularClick",
      uMengPageArived:"Um_Event_PageView"
    }
    const isTabbarPage = false;
    setBackPagePath("/pages/index/index", isTabbarPage);
    // Slam场景展示页面需要申请camera权限。如果小程序配置基础库最低版本>=2.14.4，也可不设置此API。
     setAuthorize(wx.authorize);
    // 适配Slam场景展示页面返回按钮的位置。如果小程序配置基础库最低版本>=2.15.0，也可不设置此API。
    setMenuButtonBoundingClientRect(wx.getMenuButtonBoundingClientRect());

     /**
     * 配置Slam场景展示页面转发时的信息，即onShareAppMessage方法的返回值对象。
     * 配置对象参考：https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
     * 分享信息拥有默认的分享值。title为场景标题，imageUrl为默认分享图，path为页面路径和页面参数。
     * 此处设置的信息会和默认值融合，因此如果要使用默认信息，不添加某字段即可。
     * 如果要覆盖默认值，此处增加字段，指定新值即可。
     * 如果多次调用，则只会使用最后一次调用的值。
     */
    setShareInfo({
      title: "分享",
      path: "/pages/scene/scene",
      imageUrl: "", // 设置时，会覆盖页面参数指定的缩略图地址
      promise: new Promise((resolve) => {  
      }),
    });
    
  },
});
