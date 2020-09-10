// pages/playlist/playlist.js
const MAX_LIMIT = 12
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // openid: ''
    // 轮播图数据
    swiperImgUrls: [
      { url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg', },
      { url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg', },
      { url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg', }
    ],
    playList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.cloud.callFunction({name: 'login'}).then(res => {
    //   console.log(res)
    //   this.setData({
    //     openid: res.result.openid
    //   })
    //   console.log(this.openid)
    // })
    this._getMusic()
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
      playList: []
    })
    this._getMusic()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getMusic()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

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