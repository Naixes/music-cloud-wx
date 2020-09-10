// components/musiclist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      this.setData({
        activeId: event.currentTarget.dataset.musicid
      })
    }
  }
})
