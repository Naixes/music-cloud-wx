// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
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
    onGetUserInfo(e) {
      // console.log(e)
      const userInfo = e.detail.userInfo
      if(userInfo) {
        this.triggerEvent('loginSuccess', userInfo)
        this.setData({
          modalShow: false
        })
      }else{
        this.triggerEvent('loginFail')
      }
    }
  }
})
