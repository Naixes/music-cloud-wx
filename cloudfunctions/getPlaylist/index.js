// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise')

const db = cloud.database()
const playlistCollection = db.collection('playlist')
// const URL = 'http://musicapi.xiecheng.live/personalized'

// 云函数入口函数
exports.main = async (event, context) => {
  // 这个接口现在用不了
  // const playlist = await rp(URL).then(res => {
  //   return JSON.parse(res).result
  // })
  const playlist = [
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b2","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0},
    {"_id":"08560c9e5d042a5c0174f1da7aa357ab","highQuality":false,"copywriter":"热门推荐","canDislike":true,"playCount":622822.6,"id":2.740107647e+09,"name":"「时空潜行」囿于昼夜的空想主义者","type":0.0,"alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.955Z"},"picUrl":"https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg","trackCount":20.0},
    {"_id":"08560c9e5d042a5c0174f1de21c7e79f","id":2.828842343e+09,"type":0.0,"name":"粤语情诗：与你听风声，观赏过夜星","picUrl":"https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg","highQuality":false,"alg":"cityLevel_unknow","playCount":1.785097e+06,"trackCount":52.0,"copywriter":"热门推荐","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:36.982Z"}},
    {"_id":"08560c9e5d042a5d0174f1e67d1bb16g","playCount":7.719329e+06,"highQuality":false,"trackCount":950.0,"alg":"cityLevel_unknow","id":9.17794768e+08,"type":0.0,"name":"翻唱简史：日本四百首","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:37.037Z"},"copywriter":"热门推荐","picUrl":"https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg"},
    {"_id":"08560c9e5d042a5d0174f1ea32c4c288","type":0.0,"copywriter":"热门推荐","highQuality":false,"createTime":{"$date":"2019-06-14T23:14:37.097Z"},"id":2.201879658e+09,"alg":"cityLevel_unknow","playCount":1.06749088e+08,"name":"你的青春里有没有属于你的一首歌？","picUrl":"https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg","canDislike":true,"trackCount":169.0},
    {"_id":"08560c9e5d0829820362a79f4b049d2d","alg":"cityLevel_unknow","name":"「乐队的夏天」参赛歌曲合集丨EP04更新","highQuality":false,"picUrl":"http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg","trackCount":158.0,"createTime":{"$date":"2019-06-18T00:00:02.553Z"},"copywriter":"热门推荐","playCount":1.5742008e+06,"canDislike":true,"id":2.79477263e+09,"type":0.0},
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b3","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0},
    {"_id":"08560c9e5d042a5c0174f1da7aa357ac","highQuality":false,"copywriter":"热门推荐","canDislike":true,"playCount":622822.6,"id":2.740107647e+09,"name":"「时空潜行」囿于昼夜的空想主义者","type":0.0,"alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.955Z"},"picUrl":"https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg","trackCount":20.0},
    {"_id":"08560c9e5d042a5c0174f1de21c7e79g","id":2.828842343e+09,"type":0.0,"name":"粤语情诗：与你听风声，观赏过夜星","picUrl":"https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg","highQuality":false,"alg":"cityLevel_unknow","playCount":1.785097e+06,"trackCount":52.0,"copywriter":"热门推荐","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:36.982Z"}},
    {"_id":"08560c9e5d042a5d0174f1e67d1bb16f","playCount":7.719329e+06,"highQuality":false,"trackCount":950.0,"alg":"cityLevel_unknow","id":9.17794768e+08,"type":0.0,"name":"翻唱简史：日本四百首","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:37.037Z"},"copywriter":"热门推荐","picUrl":"https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg"},
    {"_id":"08560c9e5d042a5d0174f1ea32c4c289","type":0.0,"copywriter":"热门推荐","highQuality":false,"createTime":{"$date":"2019-06-14T23:14:37.097Z"},"id":2.201879658e+09,"alg":"cityLevel_unknow","playCount":1.06749088e+08,"name":"你的青春里有没有属于你的一首歌？","picUrl":"https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg","canDislike":true,"trackCount":169.0},
    {"_id":"08560c9e5d0829820362a79f4b049d2e","alg":"cityLevel_unknow","name":"「乐队的夏天」参赛歌曲合集丨EP04更新","highQuality":false,"picUrl":"http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg","trackCount":158.0,"createTime":{"$date":"2019-06-18T00:00:02.553Z"},"copywriter":"热门推荐","playCount":1.5742008e+06,"canDislike":true,"id":2.79477263e+09,"type":0.0},
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b4","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0},
    {"_id":"08560c9e5d042a5c0174f1da7aa357ad","highQuality":false,"copywriter":"热门推荐","canDislike":true,"playCount":622822.6,"id":2.740107647e+09,"name":"「时空潜行」囿于昼夜的空想主义者","type":0.0,"alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.955Z"},"picUrl":"https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg","trackCount":20.0},
    {"_id":"08560c9e5d042a5c0174f1de21c7e79j","id":2.828842343e+09,"type":0.0,"name":"粤语情诗：与你听风声，观赏过夜星","picUrl":"https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg","highQuality":false,"alg":"cityLevel_unknow","playCount":1.785097e+06,"trackCount":52.0,"copywriter":"热门推荐","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:36.982Z"}},
    {"_id":"08560c9e5d042a5d0174f1e67d1bb16h","playCount":7.719329e+06,"highQuality":false,"trackCount":950.0,"alg":"cityLevel_unknow","id":9.17794768e+08,"type":0.0,"name":"翻唱简史：日本四百首","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:37.037Z"},"copywriter":"热门推荐","picUrl":"https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg"},
    {"_id":"08560c9e5d042a5d0174f1ea32c4c280","type":0.0,"copywriter":"热门推荐","highQuality":false,"createTime":{"$date":"2019-06-14T23:14:37.097Z"},"id":2.201879658e+09,"alg":"cityLevel_unknow","playCount":1.06749088e+08,"name":"你的青春里有没有属于你的一首歌？","picUrl":"https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg","canDislike":true,"trackCount":169.0},
    {"_id":"08560c9e5d0829820362a79f4b049d2f","alg":"cityLevel_unknow","name":"「乐队的夏天」参赛歌曲合集丨EP04更新","highQuality":false,"picUrl":"http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg","trackCount":158.0,"createTime":{"$date":"2019-06-18T00:00:02.553Z"},"copywriter":"热门推荐","playCount":1.5742008e+06,"canDislike":true,"id":2.79477263e+09,"type":0.0},
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b5","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0},
    {"_id":"08560c9e5d042a5c0174f1da7aa357ae","highQuality":false,"copywriter":"热门推荐","canDislike":true,"playCount":622822.6,"id":2.740107647e+09,"name":"「时空潜行」囿于昼夜的空想主义者","type":0.0,"alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.955Z"},"picUrl":"https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg","trackCount":20.0},
    {"_id":"08560c9e5d042a5c0174f1de21c7e79i","id":2.828842343e+09,"type":0.0,"name":"粤语情诗：与你听风声，观赏过夜星","picUrl":"https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg","highQuality":false,"alg":"cityLevel_unknow","playCount":1.785097e+06,"trackCount":52.0,"copywriter":"热门推荐","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:36.982Z"}},
    {"_id":"08560c9e5d042a5d0174f1e67d1bb161","playCount":7.719329e+06,"highQuality":false,"trackCount":950.0,"alg":"cityLevel_unknow","id":9.17794768e+08,"type":0.0,"name":"翻唱简史：日本四百首","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:37.037Z"},"copywriter":"热门推荐","picUrl":"https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg"},
    {"_id":"08560c9e5d042a5d0174f1ea32c4c281","type":0.0,"copywriter":"热门推荐","highQuality":false,"createTime":{"$date":"2019-06-14T23:14:37.097Z"},"id":2.201879658e+09,"alg":"cityLevel_unknow","playCount":1.06749088e+08,"name":"你的青春里有没有属于你的一首歌？","picUrl":"https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg","canDislike":true,"trackCount":169.0},
    {"_id":"08560c9e5d0829820362a79f4b049d2f","alg":"cityLevel_unknow","name":"「乐队的夏天」参赛歌曲合集丨EP04更新","highQuality":false,"picUrl":"http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg","trackCount":158.0,"createTime":{"$date":"2019-06-18T00:00:02.553Z"},"copywriter":"热门推荐","playCount":1.5742008e+06,"canDislike":true,"id":2.79477263e+09,"type":0.0},
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b6","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0},
    {"_id":"08560c9e5d042a5c0174f1da7aa357aj","highQuality":false,"copywriter":"热门推荐","canDislike":true,"playCount":622822.6,"id":2.740107647e+09,"name":"「时空潜行」囿于昼夜的空想主义者","type":0.0,"alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.955Z"},"picUrl":"https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg","trackCount":20.0},
    {"_id":"08560c9e5d042a5c0174f1de21c7e79e","id":2.828842343e+09,"type":0.0,"name":"粤语情诗：与你听风声，观赏过夜星","picUrl":"https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg","highQuality":false,"alg":"cityLevel_unknow","playCount":1.785097e+06,"trackCount":52.0,"copywriter":"热门推荐","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:36.982Z"}},
    {"_id":"08560c9e5d042a5d0174f1e67d1bb162","playCount":7.719329e+06,"highQuality":false,"trackCount":950.0,"alg":"cityLevel_unknow","id":9.17794768e+08,"type":0.0,"name":"翻唱简史：日本四百首","canDislike":true,"createTime":{"$date":"2019-06-14T23:14:37.037Z"},"copywriter":"热门推荐","picUrl":"https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg"},
    {"_id":"08560c9e5d042a5d0174f1ea32c4c282","type":0.0,"copywriter":"热门推荐","highQuality":false,"createTime":{"$date":"2019-06-14T23:14:37.097Z"},"id":2.201879658e+09,"alg":"cityLevel_unknow","playCount":1.06749088e+08,"name":"你的青春里有没有属于你的一首歌？","picUrl":"https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg","canDislike":true,"trackCount":169.0},
    {"_id":"08560c9e5d0829820362a79f4b049d2d","alg":"cityLevel_unknow","name":"「乐队的夏天」参赛歌曲合集丨EP04更新","highQuality":false,"picUrl":"http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg","trackCount":158.0,"createTime":{"$date":"2019-06-18T00:00:02.553Z"},"copywriter":"热门推荐","playCount":1.5742008e+06,"canDislike":true,"id":2.79477263e+09,"type":0.0}
  ]
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
      if(playlist[i]._id === dbList.data[j]._id) {
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