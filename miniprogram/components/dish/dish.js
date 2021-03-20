// components/dish/dish.js
Component({
  /**
   * 组件的属性列表
   */
  externalClasses: ['prent-class','item'],
  properties: {
    dishList:{
      type:Object,
      value:{},
    },
    height:{
      type:Number,
      value:0
    }
  },
  lifetimes:{
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
    //跳往菜谱详情页面
    toDetails(e) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}`,
      })
    },
  }
})
