// components/lyric/lyric.js
const backgroundAudioManager = wx.getBackgroundAudioManager()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      default: false
    },
    lyric: String
  },

  observers: {
    lyric(lrc) {
      // console.log(lrc)
      this._parseLyric(lrc)
      console.log(backgroundAudioManager.currentTime)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lyricList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _parseLyric(sLrc) {
      const line = sLrc.split('\n')
      let lyricList = []
      line.forEach(ele => {
        const time = ele.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        // console.log(time)
        if(time) {
          const lrc = ele.split(time)[1]
          const timeObj = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          console.log(timeObj)
          const seconds = parseInt(timeObj[1]) * 60 + parseInt(timeObj[2]) + parseInt(timeObj[3]) / 1000
          lyricList.push({
            lrc,
            second: seconds
          })
        }
      });
      this.setData({
        lyricList
      })
    }
  }
})
