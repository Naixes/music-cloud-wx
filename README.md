# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 云函数/云数据库

右键云函数文件夹新建node云函数

使用第三方库`request, request-promise`来发送请求

**使用云函数获取数据插入数据库**

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

**突破数据库获取数据条数限制，并实现数据去重**

```js
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
```

**定时触发云函数**

新建config.json文件

```json
{
  // triggers 字段是触发器数组，目前仅支持一个触发器，即数组只能填写一个，不可添加多个
  "triggers": [
    {
      // name: 触发器的名字，规则见下方说明
      "name": "myTrigger",
      // type: 触发器类型，目前仅支持 timer (即 定时触发器)
      "type": "timer",
      // config: 触发器配置，在定时触发器下，config 格式为 cron 表达式，规则见下方说明
      "config": "0 0 2 1 * * *"
    }
  ]
}
```

Cron 表达式有七个必需字段，按空格分隔。

| 第一位 | 第二位 | 第三位 | 第四位 | 第五位 | 第六位 | 第七位 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| 秒     | 分钟   | 小时   | 日     | 月     | 星期   | 年     |

其中，每个字段都有相应的取值范围：

| 字段 | 值                                                           | 通配符  |
| :--- | :----------------------------------------------------------- | :------ |
| 秒   | 0-59 的整数                                                  | , - * / |
| 分钟 | 0-59 的整数                                                  | , - * / |
| 小时 | 0-23 的整数                                                  | , - * / |
| 日   | 1-31 的整数（需要考虑月的天数）                              | , - * / |
| 月   | 1-12 的整数 或 JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC | , - * / |
| 星期 | 0-6 的整数 或 MON,TUE,WED,THU,FRI,SAT,SUN；其中 0 指星期一，1 指星期二，依次类推 | , - * / |
| 年   | 1970~2099 的整数                                             | , - * / |

1. 通配符

| 通配符     | 含义                                                         |
| :--------- | :----------------------------------------------------------- |
| , (逗号)   | 代表取用逗号隔开的字符的并集。例如：在“小时”字段中 1,2,3 表示1点、2点和3点 |
| - (破折号) | 包含指定范围的所有值。例如：在“日”字段中，1-15 包含指定月份的 1 号到 15 号 |
| * (星号)   | 表示所有值。在“小时”字段中，* 表示每个小时                   |
| / (正斜杠) | 指定增量。在“分钟”字段中，输入 1/10 以指定从第一分钟开始的每隔十分钟重复。例如，第 11 分钟、第 21 分钟和第 31 分钟，依此类推 |

2. 注意事项

- 在 Cron 表达式中的“日”和“星期”字段同时指定值时，两者为“或”关系，即两者的条件分别均生效。

3. 示例

下面展示了一些 Cron 表达式和相关含义的示例：

- `*/5 * * * * * *` 表示每5秒触发一次
- `0 0 2 1 * * *` 表示在每月的1日的凌晨2点触发
- `0 15 10 * * MON-FRI *` 表示在周一到周五每天上午10:15触发
- `0 0 10,14,16 * * * *` 表示在每天上午10点，下午2点，4点触发
- `0 */30 9-17 * * * *` 表示在每天上午9点到下午5点内每半小时触发
- `0 0 12 * * WED *` 表示在每个星期三中午12点触发