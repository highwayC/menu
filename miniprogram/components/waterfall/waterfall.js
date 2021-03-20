// components/waterfall/waterfall.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num1:{
      type:Number,
      value:0
    },
    num2:{
      type:Number,
      value:0
    },
    Allheight:{
      type:Number,
      value:0,
    },
    col1:{
      type:Array,
      value:[]
    },
    col2:{
      type:Array,
      value:[]
    }
  },
  //     let col1 = this.data.col1
  //     for(let i in col1) {
  //       // 节点布局相交状态,它是一个新的API，叫做IntersectionObserve，这一组API常常可以用于推断某些节点是否可以被用户看见、有多大比例可以被用户看见。
  //       // createIntersectionObserver([this], [options])，创建一个IntersectionObserver实例
  //       // intersectionObserver.relativeToViewport([margin])，指定页面显示区域为参照区域，margin可扩大区域
  //       //intersectionObserver.observer(targetSelector, callback)，参数为指定监听的节点和一个回调函数，
  //       //目标元素的相交状态发生变化时就会触发此函数，callback函数包含一个result
  //       //使用intersectionRatio（相交比例）进行判断，当它大于0时说明是相交的也就是可见的
  
  //       //注意在小程序自定义组件中wx.createIntersectionObserver 换成 this.createIntersectionObserver其他不变
  //       this.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
  //         if(res.intersectionRatio>0) {
  //           col1[i].show=true;
  //         }
  //         this.setData({
  //           col1
  //         })
  //       })
  //     }
  //   },
  methods: {
    //跳往菜单详细页面
    toDetails(e) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}`,
      })
    },
  }
})
