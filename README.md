# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 云环境

一个用户最多两个

## 云函数/云数据库

右键云函数文件夹新建node云函数

使用第三方库`request, request-promise`来发送请求

### **使用云函数获取数据插入数据库**

```js
// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

cloud.init()

const db = cloud.database()
const URL = 'https://apis.imooc.com/personalized?icode=A0CD56251BD9C237'

// 云函数入口函数
exports.main = async (event, context) => {
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })
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

### **突破数据库获取数据条数限制，并实现数据去重**

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

### **定时触发云函数**

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

注意：上传触发器后生效

### **云函数配置**

超时时间等

### 在页面上执行云函数更新数据

```js
  _getMusic() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "music",
      data: {
        start: this.data.playList.length,
        limit: MAX_LIMIT
      }
    }).then(res => {
      this.setData({
        // 云函数的返回值在result中
        playList: this.data.playList.concat(res.result.data)
      })
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  }
})
```

### tcb-router

一个用户在一个云环境中最多创建50个云函数

将相似的请求放到同一个云函数中处理

koa风格的云函数路由库

#### koa洋葱模型

中间件

#### 使用

安装

use定于全局中间件，router定义局部中间件

```js
// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
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
```

日志需要在云函数的日志中查看

### 将数据存储到本地

```js
...
// 将音乐列表数据存到本地
wx.setStorageSync('musiclist', pl.tracks)
...
```

### 引入字体图标

```css
/**app.wxss**/
@import "iconfont.wxss";


<!-- 控制器 -->
<view class="control">
<view class="iconfont icon-shangyishoushangyige"></view>
<view class="iconfont icon-bofang"></view>
<view class="iconfont icon-xiayigexiayishou"></view>
</view>
```

### 背景播放音乐

```js
// 获取背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

...
// 设置背景音乐管理器，如果需要退出后继续播放还要设置requiredBackgroundModes
backgroundAudioManager.src = res.result.data[0].url
backgroundAudioManager.title = musicinfo.name
backgroundAudioManager.coverImgUrl = musicinfo.al.picUrl
backgroundAudioManager.singer = musicinfo.ar[0].name
backgroundAudioManager.epname = musicinfo.al.name

// 配置
"requiredBackgroundModes": [
    "audio"
]

// 事件
backgroundAudioManager.onPlay(() => {
    console.log('onPlay')
})

backgroundAudioManager.onStop(() => {
    console.log('onStop')
})

backgroundAudioManager.onPause(() => {
    console.log('Pause')
})

backgroundAudioManager.onWaiting(() => {
    console.log('onWaiting')
})

backgroundAudioManager.onCanplay(() => {
    console.log('onCanplay')
})

// 音乐进入后台播放时不会触发
backgroundAudioManager.onTimeUpdate(() => {
    console.log('onTimeUpdate')
})

backgroundAudioManager.onEnded(() => {
    console.log("onEnded")
})

backgroundAudioManager.onError((res) => {
    console.error(res.errMsg)
    console.error(res.errCode)
    wx.showToast({
        title: '错误:' + res.errCode,
    })
})

```

### 可移动组件

进度条：

```html
<!--components/progress-bar/progress-bar.wxml-->
<view class="container">
  <text class="time">{{showTime.currentTime}}</text>
  <view class="control">
    <movable-area class="movable-area">
    <!-- dampling：阻尼系数 -->
      <!-- 滑动区 -->
      <movable-view 
        class="movable-view"
        direction="horizontal"
        dampling="1000"
        x="{{moveableDis}}"
      ></movable-view>
    </movable-area>
    <!-- 进度条 -->
    <progress
      stroke-width="4"
      backgroundColor="#969696"
      activeColor="#fff"
      percent="{{progress}}"
    ></progress>
  </view>
  <text class="time">{{showTime.totalTime}}</text>
</view>
```

**获取元素宽度**

```js
const query = this.createSelectorQuery()
query.select('.movable-area').boundingClientRect()
query.select('.movable-view').boundingClientRect()
query.exec(rect => {
    console.log(rect)
    moveableAreaWidth = rect[0].width
    moveableViewWidth = rect[1].width
})
```

### 组件生命周期

```js
Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  // 组件页面生命周期
  pageLifetimes: {
    show: function() {
      // 页面被展示
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  }
})
```

### 优化

减少setData()的使用频率

### 自定义事件

```js
// 子组件触发事件
this.triggerEvent('musicPlay')
```
父组件绑定事件

```html
<!-- 进度条 -->
    <view class="progress-bar">
        <s-progress-bar bind:musicPlay="onPlay" bind:musicPause="onPause" isSame="{{isSame}}" bind:timeUpdate="timeUpdate" bind:playEnd="toNext"></s-progress-bar>
</view>
```

### 在组件中使用全局样式

由于组件存在样式隔离所以不能引用到全局的样式

**方法1：拷贝对应样式到子组件**

**方法2：使用父组件传递样式**

注意：传递进来的样式类不能修改

```html
<!-- 父组件 -->
<s-search iconfont="iconfont" icon-sousuo="icon-sousuo" />
<!-- 子组件 -->
<i class="iconfont icon-sousuo find"></i>
<!-- js：接收传递的样式类 -->
externalClasses: [
    'iconfont',
    'icon-sousuo',
],
```

**方法3：关闭样式隔离**

默认情况下，自定义组件的样式只受到自定义组件 wxss 的影响。除非以下两种情况：

- `app.wxss` 或页面的 `wxss` 中使用了标签名选择器（或一些其他特殊选择器）来直接指定样式，这些选择器会影响到页面和全部组件。通常情况下这是不推荐的做法。
- 指定特殊的样式隔离选项 `styleIsolation` 。

```js
Component({
  options: {
    styleIsolation: 'isolated'
  }
})
```

`styleIsolation` 选项从基础库版本 [2.6.5](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html) 开始支持。它支持以下取值：

- `isolated` 表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）；
- `apply-shared` 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面；
- `shared` 表示页面 wxss 样式将影响到自定义组件，自定义组件 wxss 中指定的样式也会影响页面和其他设置了 `apply-shared` 或 `shared` 的自定义组件。（这个选项在插件中不可用。）

**使用后两者时，请务必注意组件间样式的相互影响。**

页面的默认值为 `shared` ，且还有以下几个额外的样式隔离选项可用：

- `page-isolated` 表示在这个页面禁用 app.wxss ，同时，页面的 wxss 不会影响到其他自定义组件；
- `page-apply-shared` 表示在这个页面禁用 app.wxss ，同时，页面 wxss 样式不会影响到其他自定义组件，但设为 `shared` 的自定义组件会影响到页面；
- `page-shared` 表示在这个页面禁用 app.wxss ，同时，页面 wxss 样式会影响到其他设为 `apply-shared` 或 `shared` 的自定义组件，也会受到设为 `shared` 的自定义组件的影响。

从小程序基础库版本 [2.10.1](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html) 开始，也可以在页面或自定义组件的 json 文件中配置 `styleIsolation` （这样就不需在 js 文件的 `options` 中再配置）。例如：

```json
{
  "styleIsolation": "isolated"
}
```

此外，小程序基础库版本 [2.2.3](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html) 以上支持 `addGlobalClass` 选项，即在 `Component` 的 `options` 中设置 `addGlobalClass: true` 。 这个选项等价于设置 `styleIsolation: apply-shared` ，但设置了 `styleIsolation` 选项后这个选项会失效。

```js
/* 组件 custom-component.js */
Component({
  options: {
    addGlobalClass: true,
  }
})
<!-- 组件 custom-component.wxml -->
<text class="red-text">这段文本的颜色由 `app.wxss` 和页面 `wxss` 中的样式定义来决定</text>
/* app.wxss */
.red-text {
  color: red;
}
```

### 插槽

```html
<!-- 子组件：具名插槽 -->
<slot name="modal-content"></slot>

options: {
    // 设置是否使用具名插槽
    multipleSlots: true
},

<!-- 父组件 -->
<s-bottom-modal modalShow="{{modalShow}}">
    <view slot="modal-conten">
    	...
    </view>
</s-bottom-modal>
```



