// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rp = require('request-promise')

cloud.init()

const BASE_URL = 'https://apis.imooc.com'
const ICODE='icode=A0CD56251BD9C237';

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('musiclist', async (ctx, next) => {
    ctx.body = await rp(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`)
    .then(res => {
      return JSON.parse(res)
    })
  })

  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
    .skip(event.start)
    .limit(event.limit)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res
    })
  })

  return app.serve()
}