// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  // 页面传递过来的数据
  properties: {
    playlist: {
      type: Object,
    }
  },

  // 监听器
  observers: {
    ["playlist.playCount"](count) {
      this.setData({
        // 新增属性保存处理过后的值
        _count: this._transNumber(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },
    _transNumber(num, point) {
      const numStr = num.toString().split('.')[0]
      if(numStr.length < 6) {
        return numStr
      }else if(numStr.length >= 6 && numStr.length <=8) {
        // 小数位
        const decimal = numStr.substring(numStr.length-4, numStr.length-4+point)
        return parseFloat(parseInt(num/10000) + '.' + decimal) + '万'
      }else if(numStr.length > 8) {
        // 小数位
        const decimal = numStr.substring(numStr.length-8, numStr.length-8+point)
        return parseFloat(parseInt(num/100000000) + '.' + decimal) + '亿'
      }
    }
  }
})