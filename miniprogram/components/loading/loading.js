// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loading:{
      type:Boolean,
      value:false,
    },
    isAllLoaded:{
      type:Boolean,
      value:false,
    },
    loadingText:{
      type:String,
      value:"正在加载中"
    },
    allLoadedText:{
      type:String,
      value:"我是有底线的"
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

  }
})
