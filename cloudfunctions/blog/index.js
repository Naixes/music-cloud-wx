// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const blogCollection = db.collection('blog')
const commentCollection = db.collection('blog-comment')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  // 获取博客详情
  app.router('blogDetail', async (ctx, next) => {
    // 获取博客内容
    const detail = await blogCollection.where({_id: event.blogId}).get().then(res => {
      return res.data
    })
    // 获取评论列表
    let commentList = {
      data: []
    }
    // 获取评论数量
    const countResult = await commentCollection.count()
    const count = countResult.total
    if(count > 0) {
      const batchTimes = Math.ceil(count / MAX_LIMIT)
      const tasks = []
      for (let index = 0; index < batchTimes; index++) {
        const promise = commentCollection
        .skip(index * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .where({blogId: event.blogId})
        .orderBy('createTime', 'desc')
        .get()
        tasks.push(promise)
      }
      if(tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body = {
      detail,
      commentList
    }
  })

  // 获取博客列表
  app.router('bloglist', async (ctx, next) => {
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