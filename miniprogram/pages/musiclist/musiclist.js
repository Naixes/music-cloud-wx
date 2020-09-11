// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 歌单信息
    listInfo: {},
    // 歌曲列表
    musicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    wx.showLoading({
      title: '加载中'
    })
    // 获取歌单信息和歌曲列表
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'musiclist',
        playlistId: options.playlistId
      }
    }).then(res => {
      // console.log('res', res)
      const pl = res.result.playlist
      this.setData({
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name
        },
        musicList: pl.tracks,
      })
      wx.hideLoading()
      // 将数据存到本地
      wx.setStorageSync('musiclist', pl.tracks)
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