const water=require("../../api/waterFall")
const show=require("../../api/lazyLoad");
const tool = require("../../api/tool");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[{id:"cfe347375f2cfc81002893ad1a91b04c",name:"麻辣口水鸡🐤",Pic:"cloud://highway-fi8lb.6869-highway-fi8lb-1302259954/images/1596783743025.jpg"},{id:"3adec2825f2cf882003d2e8c0455b1f3",name:"糯米凉糕",Pic:"cloud://highway-fi8lb.6869-highway-fi8lb-1302259954/images/1596782717761.jpg"},{id:"4a46c0515f2d00630035ac97158e5dca",name:"糖醋鸡胸肉",Pic:"cloud://highway-fi8lb.6869-highway-fi8lb-1302259954/images/1596784737798.jpg"},{id:"3adec2825f2cf5de003d112824afe13d",name:"日式芝士饭团",Pic:"cloud://highway-fi8lb.6869-highway-fi8lb-1302259954/images/1596782041818.jpg"}], //轮播图的数据列表
    page:0 ,  //从数据库获取出的数据的页码数
    loading: false,  //加载的图标是否展示出来
    isAllLoaded: false, //全部加载完成的图标是否展示出来
    Allheight:0, //所有数据的总高度
    col1H:0,  //第一列所展示出的数据的总高度
    col2H:0,  //第二列所展示出的数据的总高度
    col1: [],  //第一列存的数据
    col2: [],  //第二列存的数据
    screenHeight:0, //屏幕的高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let screenHeight = wx.getSystemInfoSync().screenHeight + 30
    let col1 = [];
    let col2 = [];
    let col1H=0,col2H=0;
    water.loadData({},col1,col2,col1H,col2H).then(result=>{
      this.setData({
        screenHeight,
        col1:result.col1,
        col2:result.col2,
        col1H:result.col1H,
        col2H:result.col2H,
        Allheight:result.Allheight
      })
      show.showImg('#item',this.data.col1,screenHeight,'.item-0',this).then(res=>{
        this.setData({
          col1:res
        })
      })
      show.showImg('#item',this.data.col2,screenHeight,'.item-1',this).then(res=>{
        this.setData({
          col2:res
        })
      })
    })
  },
  //在页面滚动时，如果频繁地setData会导致操作反馈延迟等问题，会出现延误。
  //这时候要选择函数防抖或节流
  onPageScroll:tool.throttle((res,that)=>{
    // console.log(that)
    const data = that.data
    show.showImg('#item',data.col1,data.screenHeight,'.item-0',that).then(res=>{
      that.setData({
        col1:res
      })
    })
    show.showImg('#item',data.col2,data.screenHeight,'.item-1',that).then(res=>{
      that.setData({
        col2:res
      })
    })
  }),
  //跳往搜索页面
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //上拉触底的生命周期函数
  //onReachBottom 事件不能在350ms之内频繁触发 也就是说它有350ms的频率限制
  //触发这个事件的时候 应使用setTimeout在函数里面延迟一定的毫秒数再来请求数据 这样就不会导致频繁触发了
  onReachBottom: function() {
    //手指上拉，会触发多次 onReachBottom，应为一次上拉，只触发一次  
    const data = this.data;
    if (data.isAllLoaded) return;  
    let page=data.page+1;
    this.setData({ 
      loading: true,
      page
    });
    let col1 = data.col1;
    let col2 = data.col2;
    let col1H=data.col1H,col2H=data.col2H;
    water.reachBottom({},col1,col2,col1H,col2H,page).then(result=>{
      this.setData({
        col1:result.col1,
        col2:result.col2,
        col1H:result.col1H,
        col2H:result.col2H,
        Allheight:result.Allheight,
        isAllLoaded:result.isAllLoaded,
        loading:false
      })
    })
  },
  //跳往菜谱分类页面
  showMenu() {
    wx.navigateTo({
      url: '/pages/menuDetails/menuDetails',
    })
  },
  //跳往分类好的菜谱列表页面
  todishDetails(e) {
    // console.log(e.currentTarget.dataset.title)
    wx.navigateTo({
      url: `/pages/dishDetails/dishDetails?name=${e.currentTarget.dataset.title}`,
    })
  },
  //右上角分享功能
  onShareAppMessage: (res)=> {
    return {
      title: '快来一起学做菜吧~',
      path: '/pages/index/index',
      success:(res)=>{
        // 转发成功
        this.shareClick();
      }
    }
  },
})