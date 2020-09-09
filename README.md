# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 云函数

右键云函数文件夹新建node云函数

使用第三方库`request, request-promise`来发送请求

```js
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const playlist = [
    {"_id":"08560c9e5d042a5c0174f1ca26f1d7b2","copywrier":"热门推荐","playCount":1.4641238e+06,"highQuality":false,"type":0.0,"canDislike":true,"name":"天气转热了，适合听点凉爽的歌。","alg":"cityLevel_unknow","createTime":{"$date":"2019-06-14T23:14:36.746Z"},"id":2.780381322e+09,"picUrl":"https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg","trackCount":53.0}
  ]
  // 这里的打印结果需要在云函数中查看
  console.log('playlist', playlist)
  // 将获取到的数据插入云数据库
  for (let index = 0; index < playlist.length; index++) {
    await db.collection('playlist').add({
      data: {
        ...playlist[index],
        createTime: db.serverDate()
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.error('插入失败')
    })
  }
}
```

云函数修改后需要上传部署后再进行云端测试，才能看到函数中的打印信息