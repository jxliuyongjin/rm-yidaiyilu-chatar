import { sha256 as Sha256 } from "hash.js";

function sha256(str) {
  const hash256 = new Sha256();
  hash256.update(str);
  return hash256.digest("hex");
}
 
function randomString(len = 12) {
  let str = "";
  const charRange = [
    [48, 57], // 0-9
    [65, 90], // A-Z
    [97, 122] // a-z
  ];
  for (let i = 0; i < len; i += 1) {
    const randomIndex = parseInt(Math.random() * charRange.length, 10);
    const range = charRange[randomIndex];
    const charCode = parseInt(
      range[0] + Math.random() * (range[1] - range[0]),
      10
    );
    str += String.fromCharCode(charCode);
  }
  return str;
}
 
function signature(secret, data) {
  data.timestamp = undefined;
  data.signature = undefined;
  data.nonce = undefined;
 
  const params = Object.keys(data)
    .sort()
    .filter((k) => data[k] !== undefined)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join("&");
 
  // 无论客户端处于什么时区，都获取到格林威治时间，保证和服务器一致。
  const timestamp = parseInt(+new Date() / 1000, 10);
  const nonce = randomString();
  const signature = sha256(`${secret}${nonce}${timestamp}${params}`);
 
  return { signature, nonce, timestamp };
}
export function getMeiYan(imagePath,backFun)
{
  backFun(imagePath);
  return;
  const uploadOptions = uploadFileSignature({
    url: "https://project.kivisense.com/unified-service/beauty",
    filePath: imagePath,
    name: "image",
    formData: {
        pid: "the-peoples-daily",
        beauty:"true",
        whitening:70,
    },
    success({ statusCode, data }) {
        if (statusCode === 200) {
            const { code, data: res, message } = JSON.parse(data);
            if (code === 200 && res?.beauty_url) {
                console.log("美颜后照片url", res.beauty_url);
                backFun(res.beauty_url);
            } else {
                console.error(code, message);
                backFun(message,code);
            }
        } else {
          backFun(message,statusCode)
            console.error(statusCode);
        }
    }
});
console.log(uploadOptions)
wx.uploadFile(uploadOptions);
}
 
/**
 * 上传文件签名授权
 * @param {WechatMiniprogram.UploadFileOption} config
 * @returns {WechatMiniprogram.UploadFileOption}
 */
export function uploadFileSignature(config) {
  const fileInfo = config.filePath.split("/");
  const fileName = fileInfo.pop();
 
  if (!config.formData) {
    config.formData = {};
  }
 
  const data = config.formData;
  data[config.name] = fileName;
 
  const secret = "5991fd87567fadb874c6f79ee8627812";
  Object.assign(config.formData, signature(secret, data));
 
  return config;
}
