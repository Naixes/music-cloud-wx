// components/lyric/lyric.js
// 单行歌词的高度
let lyricHeight = 0
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrollTop: 0,
    lyricList: [],
    activeIndex: -1
  },

  lifetimes: {
    ready() {
      // 计算lyricHeight
      // 获取手机信息
      wx.getSystemInfo({
        success: (res) => {
          // 将rpx转换为px，屏幕宽度为固定的750rpx
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      console.log(currentTime)
      const lyricList = this.data.lyricList
      // console.log(lyricList)
      if(lyricList.length === 0) {
        return 
      }
      // 优化：当歌曲总长度超出最后一句歌词时间时，拖动进度条到最后歌词不联动
      if(currentTime > lyricList[lyricList.length - 1].second) {
        if(this.data.activeIndex !== -1) {
          this.setData({
            activeIndex: -1,
            scrollTop: lyricList.length * lyricHeight
          })
        }
      }
      // 设置当前高亮歌词
      for (let i = 0; i < lyricList.length; i++) {
        if(currentTime < lyricList[i].second) {
          // 优化：减少重复设置同样的值
          if(this.data.activeIndex !== i - 1) {
            this.setData({
              activeIndex: i - 1,
              // 设置滚动高度
              scrollTop: (i - 1) * lyricHeight
            })
          }
          break
        }
      }
    },
    _parseLyric(sLrc) {
      const line = sLrc.split('\n')
      let lyricList = []
      line.forEach(ele => {
        const time = ele.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        // console.log(time)
        if(time) {
          const lrc = ele.split(time)[1]
          const timeObj = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeObj)
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
