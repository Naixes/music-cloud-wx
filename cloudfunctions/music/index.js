// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rp = require('request-promise')

cloud.init()

// const BASE_URL = 'https://apis.imooc.com'
// const ICODE='icode=ABE313CC0016235D';
// 换成网易云音乐的接口
const BASE_URL = 'https://api.imjad.cn/cloudmusic'

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  // 获取歌词
  app.router('lyric', async (ctx, next) => {
    ctx.body = await rp(`${BASE_URL}/?type=lyric&id=${parseInt(event.musicid)}`)
    .then(res => {
      return JSON.parse(res)
    })
  })

  // 获取歌曲播放url
  app.router('musicurl', async (ctx, next) => {
    // ctx.body = await rp(`${BASE_URL}/song/url?id=${parseInt(event.musicid)}&${ICODE}`)
    ctx.body = await rp(`${BASE_URL}/?id=${parseInt(event.musicid)}`)
    .then(res => {
      return JSON.parse(res)
    })
  })

  // 获取歌曲列表
  app.router('musiclist', async (ctx, next) => {
    // ctx.body = await rp(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`)
    ctx.body = await rp(`${BASE_URL}/?type=playlist&id=${parseInt(event.playlistId)}`)
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