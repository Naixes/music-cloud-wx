// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const blogCollection = db.collection('blog')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  // console.log(event)
  const {keyword, start, count} = event
  let w = {}
  if(keyword.trim()) {
    // 拼接搜索条件
    w = {
      // 可以直接写正则表达式，但是不适合变量
      // 可以直接写成 db.RegExp()
      content: new db.RegExp({
        regexp: keyword,
        // 不区分大小写
        options: 'i'
      })
    }
  }
  // 获取博客列表
  app.router('bloglist', async (ctx, next) => {
    ctx.body = await blogCollection
    .where(w)
    .skip(start)
    .limit(count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res
    })
  })
  
  return app.serve()
}