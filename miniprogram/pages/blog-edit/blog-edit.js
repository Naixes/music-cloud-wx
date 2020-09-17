// miniprogram/pages/blog-edit/blog-edit.js
const db = wx.cloud.database()
// 正文
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    MAX_WORDS_NUM: 140,
    MAX_IMAGES_NUM: 9,
    footerBottom: 0,
    imageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
  },

  onPreviewImage(e) {
    // 预览图片
    wx.previewImage({
      urls: this.data.imageList,
      current: e.target.dataset.src
    })
  },

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

  onDelImage(e) {
    this.data.imageList.splice(e.target.dataset.index, 1)
    this.setData({
      imageList: this.data.imageList
    })
  },

  onFocus(e) {
    // console.log(e)
    this.setData({
      // footer设置为键盘高度
      footerBottom: e.detail.height
    })
  },

  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  onInput(e) {
    // console.log(e)
    let wordsNum = e.detail.value.length
    if(wordsNum >= this.data.MAX_WORDS_NUM) {
      this.setData({
        wordsNum: `最大字数为${this.data.MAX_WORDS_NUM}`
      })
    }else {
      this.setData({
        wordsNum
      })
    }
    content = e.detail.value
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})