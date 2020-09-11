// components/progress-bar/progress-bar.js
const backgroundAudioManager = wx.getBackgroundAudioManager()
let moveableAreaWidth = 0
let moveableViewWidth = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    moveableDis: 0,
    progress: 0
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {  
    // 页面渲染完成
    ready() {
      this._getMoveableDis()
      this._bindAudioEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取滑动宽度
    _getMoveableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        console.log(rect)
        moveableAreaWidth = rect[0].width
        moveableViewWidth = rect[1].width
      })
    },
    // 给音乐管理器绑定事件
    _bindAudioEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // 获取音乐总时长
        if(typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        }else {
          setTimeout(() => {
            this._setTime()
          }, 500)
        }
      })

      // 音乐进入后台播放时不会触发
      backgroundAudioManager.onTimeUpdate(() => {
        console.log('onTimeUpdate')
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    _setTime() {
      const duration = backgroundAudioManager.duration
      const durationFmt = this._formatDuration(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _formatDuration(dur) {
      const min = this._parse0(Math.floor(dur / 60))
      const sec = this._parse0(Math.floor(dur % 60))
      return {
        min,
        sec
      }
    },
    _parse0(num) {
      return num < 10 ? '0' + num : num
    }
  },
})
