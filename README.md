# 云开发

Serverless，无服务

函数即服务

**优势**

快速开发

专注核心业务

独立开发

无需运维

数据安全

## 基础能力

- 云函数：云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码
- 云数据库：一个既可在小程序前端操作，也能在云函数中读写的 `JSON` 文档型数据库
- 云存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云调用：基于云函数免鉴权使用小程序开放接口的能力
- `HTTP API`：可以在已有项目访问云资源，实现与云开发的互通

# 云开发 `quickstart`

这是云开发的快速启动指引，其中演示了如何上手使用云开发的基础能力：

**利用云开发提供的基础能力完成项目架构**

云函数：定时触发从第三方数据服务器获取数据储存到云数据库

云调用：调用腾讯云的服务，实现模版消息推送和小程序码生成

`HTTP API`：后台管理系统

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

新建`config.json`文件

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

`Cron` 表达式有七个必需字段，按空格分隔。

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

- 在 `Cron` 表达式中的“日”和“星期”字段同时指定值时，两者为“或”关系，即两者的条件分别均生效。

3. 示例

下面展示了一些 `Cron` 表达式和相关含义的示例：

- `*/5 * * * * * *` 表示每5秒触发一次
- `0 0 2 1 * * *` 表示在每月的1日的凌晨2点触发
- `0 15 10 * * MON-FRI *` 表示在周一到周五每天上午`10:15`触发
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

### `tcb-router`

一个用户在一个云环境中最多创建50个云函数

将相似的请求放到同一个云函数中处理

`koa`风格的云函数路由库

#### `koa`洋葱模型

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

### 本地存储

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

### 全局属性

```js
//app.js
App({
  // 小程序启动
  onLaunch: function () {
    ...

    // 全局属性
    this.globalData = {
      activeMusicId: -1
    }
  },
  getActiveMusicId() {
    return this.globalData.activeMusicId
  },
  setActiveMusicId(id) {
    this.globalData.activeMusicId = id
  }
})
```

使用

```js
// 获取app
const app = getApp()
...

this.setData({
    activeId: app.getActiveMusicId()
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

减少`setData()`的使用频率

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

### `wx`默认样式问题

比如button: not([size='mini'])中的样式引起的样式问题，可以在`app.json`中删掉`"style": "v2"`

### 获取微信授权信息

```js
onPublish() {
    // 判断是否已经获取授权
    wx.getSetting({
        success: res => {
            // console.log(res)
            if(res.authSetting['scope.userInfo']) {
                // 获取用户信息
                wx.getUserInfo({
                    success: res => {
                        // console.log(res)
                        this.loginSuccess({
                            detail: res.userInfo
                        })
                    },
                })
            }else {
                // 弹出授权获取弹出层
                this.setData({
                    modalShow: true
                })
            }
        },
    })
},
```

login

```html
<view slot="modal-content">
    <button class="login" open-type="getUserInfo" bindgetuserinfo="onGetUserInfo">获取微信授权信息</button>
</view>

<!-- js -->
onGetUserInfo(e) {
    // console.log(e)
    const userInfo = e.detail.userInfo
    if(userInfo) {
        this.triggerEvent('loginSuccess', userInfo)
        this.setData({
        modalShow: false
        })
    }else{
    	this.triggerEvent('loginFail')
    }
}
```

### 原生组件

比如`textarea`

- 层级最高，不可覆盖

- 不能使用在容器中

- 不能增加动画和绝对定位

- 绑定事件时不能使用`:`

### 图片上传及预览

图片上传：

```js
onChooseImage() {
	const count = this.data.MAX_IMAGES_NUM - this.data.imageList.length
    // 选择图片
    wx.chooseImage({
		count,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
            console.log(res)
            this.setData({
                imageList: this.data.imageList.concat(res.tempFilePaths)
            })
        }
    })
},
send() {
    // 1、图片 -> 云存储 fileID 云文件ID
    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid、昵称、头像、时间
    if(content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true
    })
    let promiseArr = []
    let fileIds = []
    this.data.imageList.forEach(item => {
      const p = new Promise((resolve, reject) => {
        const suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: `blog/${Date.now()}-${Math.random() * 1000000}${suffix}`,
          filePath: item,
          success: res => {
            console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: err => {
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    })
    // 将数据插入到云数据库，在小程序插入数据库自带openid
    Promise.all(promiseArr).then(res => {
      const params = {
        // 内容、图片fileID、openid、昵称、头像、时间
        ...userInfo,
        content,
        img: fileIds,
        createTime: db.serverDate() // 服务端时间
      }
      // console.log(params)
      db.collection('blog').add({data: params}).then(res => {
        wx.hideLoading()
        // 返回页面
        wx.navigateBack()
        wx.showToast({
          title: '发布成功',
        })
        // 更新页面
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '发布失败 ',
        })
        console.log(err)
      })
    })
  },
```

图片预览：

```html
<block wx:for="{{imageList}}" wx:key="*this">
    <view class="image-wrap">
        <image data-src="{{item}}" bind:tap="onPreviewImage" class="image" src="{{item}}" mode="aspectFill"></image>
        <i data-index="{{index}}" bind:tap="onDelImage" class="iconfont icon-shanchu"></i>
    </view>
</block>

onPreviewImage(e) {
    // 预览图片
    wx.previewImage({
    urls: this.data.imageList,
    current: e.target.dataset.src
    })
},
```

### 防止事件冒泡

```html
<!-- catch：防止冒泡 -->
<image class="img" src="{{item}}" mode="aspectFill" catch:tap="onPreviewImage" data-imgsrc="{{item}}" data-imgs="{{blog.img}}"></image>
```

### 调用前一个页面的方法

```js
// 更新页面
const pages = getCurrentPages()
// 获取前一个页面
const prePage = pages[pages.length - 2]
prePage.onPullDownRefresh()
```

### 模糊查询

```js
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
```

#### 索引管理

在数据库索引管理中可以添加索引，提高查询效率，但是会占用一定空间

### 权限管理

#### 小程序端操作云数据库与云函数的区别

- 条数限制20
- 存在权限限制，可配置，默认仅创建者可读写
- 在小程序端插入数据会自带`openid`

```js
// 小程序端调用云数据库
const db = wx.cloud.database()
db.collection('blog').orderBy('createTime', 'desc').get().then((res)=>{
    console.log(res)
    const data = res.data
    for (let i = 0, len = data.length; i<len; i++){
        data[i].createTime = data[i].createTime.toString()
    }
    this.setData({
        blogList: data
    })
})
```

总结：获取数据较少或插入时需要携带`openid`时可在小程序端操作云数据库

### 数据库1对N关系设计

三种场景：

1. N为几个到几十个：一个博客最多9张图片，使用数组存在一个集合中，一次查询
2. N为几十个到几百个：使用两个集合，将N的id（主键）存储在1的数组字段中，两次查询
3. N为几千个以上：使用两个集合，将1的id（主键）存储在N的字段中，两次查询

### 消息推送（已废弃）

1. 要使用form表单

`formid`：

- 有效期7天
- 提交一次生成一个`formid`对应一个模板消息

2. 选择模板
3. 创建云函数
4. 配置云函数权限

```json
{
  "permissions": {
    "openapi": [
      "subscribeMessage.send"
    ]
  }
}
```

5. 云函数

```js
// 云函数入口函数
exports.main = async(event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      keyword1: {
        value: '评价完成'
      },
      keyword2: {
        value: event.content
      }
    },
    templateId: 'PjUkFDsOsC3ktzUATsIVy0t1D4RlL-aKbuhGUb7TLS0',
    formId: event.formId
  })
  return result
}
```

6. 调用云函数

```js
// 推送模板消息
wx.cloud.callFunction({
    name: 'sendMessage',
    data: {
        content,
        formId,
        blogId: this.properties.blogId
    }
}).then((res) => {
    console.log(res)
})
```

### 订阅消息

与「模板消息」不同的是，其是在用户点击触发或者支付成功之后，开发者可在 7天内推送1-3条服务通知。而「订阅消息」则需要用户主动订阅消息通知，开发者才可向用户推送，但不受时间限制，具体发送信息条数根据该能力的不同类型有不同标准。

此外，值得注意的是，使用「订阅消息」后，原小程序模板消息接口将于2020年1月10日下线，也就无法再使用原接口推送模板消息，开发者们需要注意及时调整接口。但是，微信服务号模板消息暂不受影响。

1. 选择模板
2. 创建云函数
3. 配置云函数权限

```json
{
  "permissions": {
    "openapi": [
      "subscribeMessage.send"
    ]
  }
}
```

4. 订阅消息并执行云函数

```js
// 订阅消息
requestSubscribeMessage(content) {
    wx.requestSubscribeMessage({
        tmplIds: ['8rltjYPoCcKO9GJELC5K5YwXXhUdYLN-ZQzKNxrdReE'],
        success: res => {
            // 消息推送
            wx.cloud.callFunction({
                name: 'sendMessage',
                data: {
                    date: formatTime(new Date()),
                    content,
                    blogId: this.properties.blogId
                }
            }).then(res => {
                // console.log(res)
            })
        }
    })
},
```

5. 云函数

```js
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
```

### 多集合查询

```js
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
```

### 分享功能

分享卡片的图片暂不支持云存储图片

在组建内使用button

```html
<!-- 设置分享功能 -->
<button open-type="share" data-blog="{{blog}}" class="share-btn">
    <i class="iconfont icon-fenxiang icon"></i>
    <text>分享</text>
</button>
```

在当前页面

```js

/**
   * 用户点击右上角分享
   */
onShareAppMessage: function (e) {
    console.log(e)
    const {blog} = e.target.dataset
    // 返回一个对象
    return {
        title: blog.content,
        path: `/pages/blog-detail/blog-detail?blogId=${blog._id}`,
        // 可以使用云文件ID
        imageUrl: blog.img[0]
    }
}
```

### 获取用户信息

不同方式的应用场景

1. 只用于显示，不需要授权，只能看到自己的

   **开放能力**：组件的形式

   ```html
   <open-data type="userAvatarUrl"></open-data>
   <open-data type="userNickName"></open-data>
   <open-data type="userCountry"></open-data>
   <open-data type="userCity"></open-data>
   ```

2. `js`中获取用户信息，已授权的情况下才能使用

   ```js
   // 获取用户信息
   wx.getUserInfo({
       success: res => {
           console.log(res)
       }
   })
   ```

3. 授权获取用户信息，通过button，小程序推荐方式

   ```html
   <button class="login" open-type="getUserInfo" bindgetuserinfo="onGetUserInfo">获取微信授权信息</button>
   ```

   ```js
   methods: {
       onGetUserInfo(e) {
           // console.log(e)
           const userInfo = e.detail.userInfo
           if(userInfo) {
               this.triggerEvent('loginSuccess', userInfo)
               this.setData({
                   modalShow: false
               })
           }else{
               this.triggerEvent('loginFail')
           }
       }
   }
   ```

4. 需要`openid`的场景，不需要授权

   **传统方式**

   小程序调用 `wx.login` 从微信服务器获取code（5分钟有效期）

   小程序调用 `wx.request` 将code传递给后台服务器

   后台服务器利用code从微信服务器获取 `openid` 和 `session_key` （会话密钥）

   后台将用户标识发送给小程序本地存储

   **云开发方式**

   用户点击触发事件，小程序通过云函数（login）获取用户信息，可以存储到云数据库

   ```js
   wx.cloud.callFunction({
       name: 'login'
   }).then(res => {
       // log
   })
   ```

   不能通过`openid`获取用户信息，必须通过授权

#### `unionid`

在微信开发平台中不同应用中`unionid`是相同的，`openid`在不同应用中是不一样的

### 生成小程序码

不推荐二维码

为满足不同需求和场景，这里提供了两个接口，开发者可挑选适合自己的接口。

- 接口 A: 适用于需要的码数量较少的业务场景`wxacode.get`
  - 生成小程序码，可接受 path 参数较长，生成个数受限，数量限制见 [注意事项](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/qr-code.html#注意事项)，请谨慎使用。
- 接口 B：适用于需要的码数量极多的业务场景`wxacode.getUnlimited`
  - 生成小程序码，可接受页面参数较短，生成个数不受限。

**注意事项**

1. 接口只能生成已发布的小程序的二维码
2. 接口 A 加上接口 C，总共生成的码数量限制为 100,000，请谨慎调用。
3. 接口 B 调用分钟频率受限(5000次/分钟)，如需大量小程序码，建议预生成。

```js
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const result = await cloud.openapi.wxacode.getUnlimited({
        scene: wxContext.OPENID,
        // 只有已发布的小程序才可以传这个参数，否则报错
        // page: 'pages/blog/blog',
        // 样式
        // 颜色
        lineColor: {
            'r': 211,
            'g': 60,
            'b': 57
        },
        // 是否透明背景
        isHyaline: true
    })
    // 将图片上传到云存储
    const upload = await cloud.uploadFile({
        cloudPath: `qrcode/${Date.now()}-${Math.random()*1000000}.png`,
        fileContent: result.buffer
    })
    return upload.fileID
}
```

#### 显示小程序码

存储到云存储中再进行展示

```js
onTapQrCode() {
    wx.showLoading({
        title: '生成中',
        mask: true
    })
    wx.cloud.callFunction({
        name: 'getQrCode'
    }).then(res => {
        const fileId = res.result
        wx.previewImage({
            urls: [fileId],
            current: fileId
        })
        wx.hideLoading()
    })
},
```

#### 获取小程序码中的参数

`options`中获取

## 底层原理

### 渲染层与逻辑层交互原理

#### 与web开发的区别

结构（html / wxml），样式（css / wxss），逻辑（js），DOM操作（DOM API / 小程序没有），渲染层和逻辑层（互斥的 / 分开的，在不同的线程中）

##### 运行环境

![小程序运行环境](E:\Jennifer\other\music-cloud-wx\media\小程序运行环境.png)

所以会有兼容问题

#### 页面渲染技术

原生技术，安卓/ios

web，渲染层和逻辑层互斥有一定性能问题

混合（Hybrid），小程序就属于这种

#### 小程序的渲染层和逻辑层

渲染层（wxml / wxss）和逻辑层（JS，API）通过Native（系统层，JSBridge，微信能力/离线存储/网络请求。。。）进行交互

![小程序的渲染层和逻辑层](E:\Jennifer\other\music-cloud-wx\media\小程序的渲染层和逻辑层.png)

比如页面事件点击后，事件会先通过系统层到逻辑层执行，执行后的结果也要通过系统层传递到渲染层，因此不推荐进行频繁的`setData`操作，并且仅将在页面显示的数据写在`data`中，都是为了避免浪费性能

### 运行机制与更新机制

#### 运行机制

冷启动（首次启动，销毁后启动）与热启动（5分钟内再次启动）

前台（运行状态）与后台（离开状态）

销毁：离开状态存活时间5分钟 / 持续占用高资源可能会被系统销毁或被微信主动回收

#### 更新机制

小程序完成开发后由开发工具编译发布到微信服务器，用户打开时会将小程序从服务器下载到微信并首次加载（冷启动）加载时会读取缓存并检查更新，热启动则是从后台切换到前台

官方说明24小时内小程序会更新到最新

##### 检查更新

```js
// 在onLaunch时调用
// 检查更新
checkUpdate() {
    const updateManager = wx.getUpdateManager()
    // 监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
    updateManager.onCheckForUpdate(res => {
        if(res.hasUpdate) {
            wx.showModal({
                title: '检查更新',
                content: '新版本已经准备好，是否重启应用',
                success(res){
                    if(res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        }
    })
},
```

### 性能与体验优化

- 合理设置可点击元素相应区大小
- 避免渲染时间过长，检查是否渲染区域过大
- 避免执行脚本时间过长，检查是否脚本逻辑是否有问题
- 对网络请求做必要的缓存避免过多请求
- 不引用未使用的样式
- 合理的色彩搭配
- 资源请求使用HTTPS
- 不使用废弃接口
- 减少wxml节点个数
  - 页面少于1000个节点
  - 节点树深度小于30层
  - 子节点树不大于60个
- 删除不能访问到的页面
- 及时回收定时器，小程序的定时器是全局的
- 避免使用伪类实现点击状态，应该使用内置的hover
- 滚动区域 开启惯性滚动增强体验
  - 安卓默认，ios要手动设置：`-webkit-overflow-scrolling: touch;`
- 避免js异常
- 所有请求响应正常，耗时不能太久
- 避免短时间发起太多图片请求/请求
- setData
  - 避免数据过大，不能超过1M
  - 避免调用频繁
  - 避免将页面不使用的数据写入data

#### 体验评分

开启后手动操作所有功能，也可以开启自动开启

### `setData`原理

`setData` 函数用于将数据从逻辑层发送到视图层（异步），同时改变对应的 `this.data` 的值（同步）。

直接修改对象时会覆盖之前的值，修改某一属性时要写成`[obj.xxx]`

修改时也可以新增属性或数据，但是建议提前声明

### 场景值`scene`

作用：行为埋点（数据分析），场景分流（不同场景值进入不同页面）

获取场景值

```js
// app.js
// 监听小程序的启动和切前台
onshow(options) {
    // 获取场景值
    console.log(options.scene)
},
// 小程序启动
onLaunch: function (options) {
    // 获取场景值
    console.log(options.scene)
}
```

`referrerInfo`：部分场景值下还可以获取来源应用、公众号或小程序的appId。

### `sitemap.json`页面收录

可以根据小程序内容进行搜索

具体配置说明

1. 页面收录设置：可对整个小程序的索引进行关闭，小程序管理后台-功能-页面内容接入-页面收录开关；
2. sitemap 配置：可对特定页面的索引进行关闭

https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html

```json
{
  "rules":[{
    "action": "allow",
    "page": "path/to/page",
    "params": ["a", "b"],
    "matching": "inclusive"
  }, {
    "action": "disallow",
    "page": "*"
  }, {
    "action": "allow",
    "page": "*"
  }]
}
```

- `path/to/page?a=1&b=2` => 优先被索引
- `path/to/page?a=1&b=2&c=3` => 优先被索引
- `path/to/page` => 不被索引
- `path/to/page?a=1` => 不被索引
- 其他页面由于命中第二条规则，所以不会被索引
- 由于优先级的问题，第三条规则是没有意义的

**注：没有 sitemap.json 则默认所有页面都能被索引**

**注：`{"action": "allow", "page": "\*"}` 是优先级最低的默认规则，未显式指明 "disallow" 的都默认被索引**

### 上线审核流程

#### 传统方式

#### 云开发方式

提交体验版：上传

提交审核

## 后台管理系统

对歌单轮播图和博客进行管理

前端：`vue`+`vue-admin-template`

后端：`http api`+`tcb-admin-node`+`koa2`

### 前端

`git clone https://github.com/PanJiaChen/vue-admin-template.git`

#### 滚动加载

### 后端

`koa`安装

#### `access_token`

接口的调用凭证，有一定限制（有效期2小时，每天2000次）所以需要缓存和更新

使用`request-promise`发送请求

存储到本地`json`文件，更新时可以提前5分钟获取

```js
const rp = require('request-promise')
const fs = require('fs')
const path = require('path')

const APPID = 'wxa04740d6201a7919'
const APPSECRET = 'b98b0c194cc9e9aca9f59bb11c369de0'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fileName = path.resolve(__dirname, './access_token.json')

const updateAccessToken = async() => {
    const resultStr = await rp(URL)
    const res = JSON.parse(resultStr)
    if(res.access_token) {
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.access_token,
            createTime: new Date()
        }))
    }else {
        await updateAccessToken()
    }
}

const getAccessToken = async () => {
    try {
        const readStr = fs.readFileSync(fileName, 'utf-8')
        const readObj = JSON.parse(readStr)
        // 判断是否过期
        const now = new Date().getTime()
        const createTime = new Date(readObj.createTime).getTime()
        if(now - createTime >= 7200000) {
            await updateAccessToken()
            await getAccessToken()
        }
        return readObj.access_token
    } catch (error) {
        await updateAccessToken()
        await getAccessToken()
    }
}

// 自动更新access_token，，更新时可以提前5分钟获取
setInterval(async () => {
    await updateAccessToken()
}, (7200 - 300) * 1000)

module.exports = getAccessToken
```

#### `koa-router`

`MVC`结构

#### CORS

安装`koa2-cors`

```js
// 跨域
app.use(cors({
    origin: ['http://localhost:9528'],
    // Access-Control-Allow-Credentials：意义是允许客户端携带验证信息，例如 cookie 之类的
    credentials: true
}))
```

#### 优化云函数调用

```js
const rp = require('request-promise')
const getAccessToken = require('../utils/getAccessToken')

const callCloudFn = async (ctx, fnName, params) => {
    const access_token = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${access_token}&env=${ctx.state.ENV}&name=${fnName}`
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            ...params
        },
        json: true // Automatically stringifies the body to JSON
    };
    return await rp(options)
    .then(function (res) {
        // console.log(res)
        return res
    })
    .catch(function (err) {
        // POST failed...
    });
}

module.exports = callCloudFn
```

#### 调用云数据库

一般情况下显示修改数据不用调用云函数可以直接操作云数据库（较快），在给用户发送消息或者获取小程序码等场景下才会用到云函数

```js
const rp = require('request-promise')
const getAccessToken = require('../utils/getAccessToken')

const callCloudDB = async (ctx, fnName, query = {}) => {
    const ACCESS_TOKEN = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            query, 
            env: ctx.state.ENV
        },
        json: true // Automatically stringifies the body to JSON
    };
    return await rp(options)
    .then(function (res) {
        // console.log(res)
        return res
    })
    .catch(function (err) {
        console.log(err)
    });
}

module.exports = callCloudDB
```

##### `koa-body`

```js
// 接收post参数解析，ctx.request.body获取
app.use(koaBody({
    multipart: true,
}))
```

##### 请求全局变量

```js
// 全局变量，ctx.state.ENV获取
app.use(async (ctx, next) => {
    ctx.state.ENV = ENV
    await next()
})
```

#### 文件下载链接

```js
const rp = require('request-promise')
const getAccessToken = require('./getAccessToken')

const cloudStorage = {
    download: async (ctx, fileList) => {
        const ACCESS_TOKEN = await getAccessToken()
        const URL = `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`
        const options = {
            method: 'POST',
            uri: URL,
            body: {
                file_list: fileList, 
                env: ctx.state.ENV
            },
            json: true // Automatically stringifies the body to JSON
        };
        return await rp(options)
        .then(function (res) {
            // console.log(res)
            return res
        })
        .catch(function (err) {
            console.log(err)
        });
    }
}

module.exports = cloudStorage
```

#### 文件上传链接

```js
upload: async (ctx, ) => {
    // 获取上传请求参数
    const ACCESS_TOKEN = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`
    const file = ctx.request.files.file
    const path = `swiper/${Date.now()}-${Math.random()*1000000}-${file.name}`
    // console.log(path)
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            path, 
            env: ctx.state.ENV
        },
        json: true // Automatically stringifies the body to JSON
    }
    const info = await rp(options)
    .then(function (res) {
        // console.log(res)
        return res
    })
    .catch(function (err) {
        console.log(err)
    });
    // 上传图片
    const upOptions = {
        method: 'POST',
        uri: info.url,
        headers: {
            'content-type': 'multipart/form-data'
        },
        formData: {
            key: path,
            Signature: info.authorization,
            'x-cos-security-token': info.token,
            'x-cos-meta-fileid': info.cos_file_id,
            // 文件的二进制内容
            file: fs.createReadStream(file.path)
        },
        json: true // Automatically stringifies the body to JSON
    }
    await rp(upOptions)
    return info.file_id

},
```

#### 删除云存储

```js
delete: async (ctx, fileIdList) => {
    const ACCESS_TOKEN = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            fileid_list: fileIdList, 
            env: ctx.state.ENV
        },
        json: true // Automatically stringifies the body to JSON
    };
    return await rp(options)
        .then(function (res) {
        // console.log(res)
        return res
    })
        .catch(function (err) {
        console.log(err)
    });
},
```

