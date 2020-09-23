// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取openid
  const {OPENID} = cloud.getWXContext()

  return await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    // 跳转的页面
    page: `/pages/blog-detail/blog-detail?blogId=${event.blogId}`,
    data: {
      time1: {value: event.date},
      thing3: {value: event.content},
      phrase2: {value: '评论成功'},
    },
    templateId: '8rltjYPoCcKO9GJELC5K5YwXXhUdYLN-ZQzKNxrdReE',
    // developer为开发版；trial为体验版；formal为正式版；默认为正式版
    miniprogramState: 'developer'
  })
}