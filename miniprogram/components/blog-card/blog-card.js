// components/blog-card/blog-card.js
import formatTime  from "../../utils/formatTime"
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },

  observers: {
    ['blog.createTime'](val) {
      this.setData({
        _createTime: formatTime(new Date(val))
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(e) {
      wx.previewImage({
        urls: e.target.dataset.imgs,
        current: e.target.dataset.imgsrc
      })
    }
  }
})
