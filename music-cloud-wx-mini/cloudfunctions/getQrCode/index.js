// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
    // 只有已发布的小程序才可以传这个参数，否则报错
    // page: 'pages/blog/blog',
    // 样式
    // 颜色
    lineColor: {
      'r': 211,
      'g': 60,
      'b': 57
    },
    // 是否透明背景
    isHyaline: true
  })
  // 将图片上传到云存储
  const upload = await cloud.uploadFile({
    cloudPath: `qrcode/${Date.now()}-${Math.random()*1000000}.png`,
    fileContent: result.buffer
  })
  return upload.fileID
}