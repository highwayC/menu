// miniprogram/pages/dishDetails/dishDetails.js
const db=wx.cloud.database();
const process=require("../../api/processFood");
const show=require("../../api/lazyLoad");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dishList:[],
    loading:false,
    isAllLoaded:false,
    page:0,
    type:'',  //菜谱的类型
    height:0,   //菜谱的高度
    screenHeight:0,  //页面的可视高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.name)
    wx.getSystemInfo({
      success: (res) => {
        // console.log(res.windowHeight)
        this.setData({
          screenHeight:res.screenHeight + 30
        })
      },
    })
    wx.setNavigationBarTitle({
      title:options.name
    })
    wx.showLoading({
      title: '正在加载中...',
    })
    db.collection('recipe').where({type:options.name}).limit(10).get().then(res=>{
      // console.log(res.data)
      if(res.data.length<10) {
        this.setData({
          isAllLoaded:true
        })
      }
      let result = process.processFood(res.data)
      this.setData({
        dishList:result,
        height:result.length*(180+12),
        type:options.name
      })
      show.showImg("#Dish",this.data.dishList,this.data.screenHeight,'.item-3',this).then(res=>{
        this.setData({
          dishList:res
        })
      })
    })
    wx.hideLoading({})
  },
  onPageScroll:function(e) {
    show.showImg("#Dish",this.data.dishList,this.data.screenHeight,'.item-3',this).then(res=>{
      this.setData({
        dishList:res
      })
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onReachBottom: function () {
    if (this.data.isAllLoaded) return;  
    let page=this.data.page+1;
    this.setData({ 
      loading: true,
      page
    });  
    let isAllLoaded=false;
    setTimeout(()=>{
      db.collection("recipe").where({
        type:this.data.type
      }).skip(page*10).limit(10).get().then(res=>{
        if(res.data.length==0) {
          isAllLoaded=true;
          this.setData({
            loading:false,
            isAllLoaded,
          })
        }else {
          let result = process.processFood(res.data)
          this.setData({
            dishList:this.data.dishList.concat(result),
            height:result.length*(180+12)+this.data.height,
            isAllLoaded,
            loading:false,
          })
        }
      })
    },200)
  }
  
})