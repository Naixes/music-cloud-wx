// pages/player/player.js
let musicindex = 0
let musiclist = []
// 获取背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    pause: true,
    showLyric: false,
    lyric: '暂无歌词'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    musicindex = options.musicindex
    this._loadMusicInfo(options.musicid)
  },
  _loadMusicInfo(musicid) {
    musiclist = wx.getStorageSync('musiclist')
    const musicinfo = musiclist[musicindex]
    // 先停止正在播放的音乐
    backgroundAudioManager.stop()
    // 设置头部标题
    wx.setNavigationBarTitle({
      title: musicinfo.name,
    })
    this.setData({
      picUrl: musicinfo.al.picUrl
    })
    console.log(musicinfo)
    // 获取播放url
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicid,
        $url: 'musicurl'
      }
    }).then(res => {
      // console.log(res.result.data[0].url)
      // 设置背景音乐管理器，如果需要退出后继续播放还要设置
      backgroundAudioManager.src = res.result.data[0].url
      backgroundAudioManager.title = musicinfo.name
      backgroundAudioManager.coverImgUrl = musicinfo.al.picUrl
      backgroundAudioManager.singer = musicinfo.ar[0].name
      backgroundAudioManager.epname = musicinfo.al.name
      this.setData({
        pause: false
      })
      wx.hideLoading()

      // 获取歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicid,
          $url: 'lyric',
        }
      }).then(res => {
        console.log(res)
        this.setData({
          lyric: res.result.lrc.lyric
        })
      })
    })
  },
  toggleShow() {
    this.setData({
      showLyric: !this.data.showLyric
    })
  },
  togglePlaying() {
    if(this.data.pause) {
      backgroundAudioManager.play()
    }else {
      backgroundAudioManager.pause()
    }
    this.setData({
      pause: !this.data.pause
    })
  },
  toPre() {
    musicindex--
    if(musicindex < 0) {
      musicindex = musiclist.length - 1
    }
    this._loadMusicInfo(musiclist[musicindex].id)
  },
  toNext() {
    musicindex++
    if(musicindex >= musiclist.length) {
      musicindex = 0
    }
    this._loadMusicInfo(musiclist[musicindex].id)
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