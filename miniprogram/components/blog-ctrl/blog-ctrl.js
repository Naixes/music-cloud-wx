// components/blog-ctrl/blog-ctrl.js
const formatTime = require('../../utils/formatTime.js')
let userInfo = {}
const db = wx.cloud.database()
Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    showLogin: false,
    showComment: false,
    // content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSend(e) {
      // console.log(userInfo)
      const content = e.detail.value.content
      const blogId = this.properties.blogId
      if(!content.trim()) {
        wx.showModal({
          title: '评论内容不能为空',
        })
        return
      }
      // 将评论插入数据库
      wx.showLoading({
        title: '评论中',
        mask: true
      })
      // 订阅消息
      this.requestSubscribeMessage(content)
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading()
        this.setData({
          showComment: false,
          // content: ''
        })
        wx.showToast({
          title: '评论成功',
        })
      })
    },
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
    // onInput(e) {
    //   this.setData({
    //     content: e.detail.value
    //   })
    // },
    onLoginSuccess(e) {
      // 保存用户信息
      userInfo = e.detail
      // 关闭授权弹窗，显示评论组件
      this.setData({
        showLogin: false
      }, () => {
        this.setData({
          showComment: true
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能评价',
      })
    },
    onComment() {
      // 判断是否授权
      wx.getSetting({
        success: res => {
          if(!res.authSetting['scope.userInfo']) {
            this.setData({
              showLogin: true
            })
          }else {
            // 获取用户信息
            wx.getUserInfo({
              success: res => {
                userInfo = res.userInfo
                // 显示评论组件
                this.setData({
                  showComment: true
                })
              }
            })
          }
        }
      })
    }
  }
})
