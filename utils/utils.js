import {ERROR,RUN} from "./log";  
export function errorHandler(errInfo) { 
  if(errInfo==null) {
    console.log("nulllllllllll")
    return;
  }
  let message = errInfo;
  if (typeof errInfo === "object") {
    if (errInfo instanceof Error) {
      message = errInfo.message;
      console.warn(errInfo.stack);
    } else if (errInfo.errMsg) {
      message = errInfo.errMsg;
    } else {
      message = Object.values(errInfo).join("; ");
    }
  }
  console.error(errInfo);
  wx.showToast({
    title: message,
    icon: "none",
  });  
  ERROR({str: message},'error log', 100, [])
}

export function log(message) {
  console.log(message); 
  RUN({str: message},'info log', 100, []) 
}

export function showAuthModal(page) {
  wx.showModal({
    title: "提示",
    content: "请给予“摄像头”权限",
    showCancel: false,
    success() {
      wx.openSetting({
        success({ authSetting: { "scope.camera": isGrantedCamera } }) {
          if (isGrantedCamera) {
            wx.redirectTo({ url: "/" + page.__route__ });
          } else {
            wx.showToast({ title: "获取“摄像头”权限失败！", icon: "none" });
          }
        },
      });
    },
  });
}

export function requestFile(url,responseType="arraybuffer") {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      dataType: "",
      responseType: responseType,
      success({ statusCode, data }) {
        if (statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`下载素材(${url})发生错误(状态码-${statusCode})`));
        }
      },
      fail: reject,
    });
  });
}

export function downloadFile(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success({ statusCode, tempFilePath }) {
        if (statusCode === 200) {
          resolve(tempFilePath);
        } else {
          reject(new Error(`下载文件：${url} 失败。statusCode：${statusCode}`));
        }
      },
      fail: reject,
    });
  });
}

export function getSlamV2Support() {
  return false;
  // 注意：目前只有iOS设备，微信版本>=8.0.17且基础库>=2.22.0才支持v2版本。 插件版本>=1.3.0支持
  //console.warn(wx.getSystemInfoSync())
  const {system, SDKVersion, version} = wx.getSystemInfoSync();
  const isIos = system.toLowerCase().includes("ios");
  if(isIos && compareVersion(version, "8.0.17") >= 0 && compareVersion(SDKVersion, "2.22.0") >= 0) {
    return true;
  }
  return false;
}

export function showmeiyan(){
  const uploadOptions = uploadFileSignature({
    url: "https://project.kivisense.com/unified-service/beauty",
    filePath: tempFilePaths[0],
    name: "image",
    formData: {
        pid: "the-peoples-daily",
        beauty:"true",
        whitening:99,
    },
    success({ statusCode, data }) {
        if (statusCode === 200) {
            const { code, data: res, message } = JSON.parse(data);
            if (code === 200 && res?.beauty_url) {
                console.log("美颜后照片url", res.beauty_url);
            } else {
                console.error(code, message);
            }
        } else {
            console.error(statusCode);
        }
    }
});
console.log(uploadOptions) 
return uploadOptions
}

export function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

export function tryFun(promise){ 
  return promise.then(res=>[res,null]).catch(err=>[null,err]); 
}