// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

cloud.init()

const db = cloud.database()
const playlistCollection = db.collection('playlist')
const URL = 'https://apis.imooc.com/personalized?icode=A0CD56251BD9C237'

// 云函数入口函数
exports.main = async (event, context) => {
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })
  // 这里的打印结果需要在云函数中查看
  // console.log('playlist', playlist)

  // 获取数据库中的数据，条数限制100，小程序端获取条数限制20
  // const dbList = await playlistCollection.get()
  // 突破条数限制：多次获取数据并拼接
  const MAX_LIMIT = 100
  const countObj = await playlistCollection.count()
  const total = countObj.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let index = 0; index < batchTimes; index++) {
    let promise = playlistCollection.skip(index * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let dbList = {
    data: []
  }
  if(tasks.length > 0) {
    dbList = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur)
      }
    })
  }
  // 获取新增的数据
  let newData = []
  for (let i = 0; i < playlist.length; i++) {
    // true标识不相等
    let flag = true
    // data中是真正的数据
    for (let j = 0; j < dbList.data.length; j++) {
      if(playlist[i].id === dbList.data[j].id) {
        flag = false
        break
      }
    }
    if(flag) {
      newData.push(playlist[i])
    }
  }

  // 将新增的数据插入云数据库
  for (let index = 0; index < newData.length; index++) {
    await playlistCollection.add({
      data: {
        ...newData[index],
        createTime: db.serverDate()
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.error('插入失败')
    })
  }

  // 返回新增数据条数
  return newData.length
}