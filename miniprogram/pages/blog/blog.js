// pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },

  onSearch(e) {
    console.log(e);
    keyword = e.detail.keyword
    // 先清空列表
    this.setData({
      blogList: []
    })
    this._loadBlogList()
  },

  _loadBlogList() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start: this.data.blogList.length,
        count: 10,
        $url: 'bloglist',
      }
    }).then((res) => {
      // console.log('res', res)
      this.setData({
        blogList: this.data.blogList.concat(res.result.data)
      })
      wx.hideLoading()
    })
  },

  goToDetail(e) {
    wx.navigateTo({
      url: `../../pages/blog-detail/blog-detail?blogid=${e.target.dataset.blogid}`,
    })
  },

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

  loginFail() {
    wx.showModal({
      title: '授权用户才能发布',
    })
  },

  loginSuccess(e) {
    // console.log(e)
    const detail = e.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
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
    this.setData({
      blogList: []
    })
    this._loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})