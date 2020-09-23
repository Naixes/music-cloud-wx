// miniprogram/pages/blog-detail.js
import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogId: '',
    blog: {},
    commentList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      blogId: options.blogId
    })
    this._loadBlogDetail()
  },

  _loadBlogDetail() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'blogDetail',
        blogId: this.data.blogId
      }
    }).then(res => {
      // console.log(res)
      let commentList = res.result.commentList.data
      commentList.forEach(ele => {
        ele.createTime = formatTime(new Date(ele.createTime))
      });
      this.setData({
        commentList,
        blog: res.result.detail[0]
      })
      wx.hideLoading()
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
    const {blog} = this.data
    return {
      title: blog.content,
      path: `/pages/blog-detail/blog-detail?blogId=${blog._id}`,
      // 可以使用云文件ID
      imageUrl: blog.img[0]
    }
  }
})