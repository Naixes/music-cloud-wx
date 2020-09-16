// components/progress-bar/progress-bar.js
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 可动区域宽度
let moveableAreaWidth = 0
// 滑块宽度
let moveableViewWidth = 0
// 当前秒数
let currentSec = 0
// 总时长
let duration = 0
// 当前是否移动，优化进度条拖动效果，锁
// 在小程序中应该尽量减少setData的频率
let isMoving = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: {
      type: Boolean,
      value: false
    }
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
      // 同一首歌曲手动设置总时长
      if(this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this._setTime()
      }
      this._getMoveableDis()
      this._bindAudioEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      if(e.detail.source === 'touch') {
        console.log(e)
        // 暂存拖动的值
        this.data.progress = e.detail.x / (moveableAreaWidth - moveableViewWidth) * 100
        this.data.moveableDis = e.detail.x
        isMoving = true
      }
    },
    // 注意：onTouchEnd执行完成之后有一定概率还会执行onChange，isMoving会出错，所以在onPlay中也设置了isMoving
    onTouchEnd() {
      console.log('onTaouchEnd')
      console.log(backgroundAudioManager.currentTime)
      // 设置拖动的值
      this.setData({
        progress: this.data.progress,
        moveableDis: this.data.moveableDis
      })
      // 设置播放
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
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
        // 注意：onTouchEnd执行完成之后有一定概率还会执行onChange，isMoving会出错，所以在onPlay中也设置了isMoving
        isMoving = false
        // 同步到页面
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        // 同步到页面
        this.triggerEvent('musicPause')
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
        // console.log('onTimeUpdate')
        if(!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          // 优化：1s触发一次
          const sec = currentTime.toString().split('.')[0]
          if(sec !== currentSec) {
            const currentTimeFmt = this._formatDuration(currentTime)
            this.setData({
              moveableDis: (moveableAreaWidth - moveableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            // console.log(sec)
            currentSec = sec

            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('playEnd')
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
      duration = backgroundAudioManager.duration
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
