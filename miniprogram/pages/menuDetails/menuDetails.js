// miniprogram/pages/menuDetails/menuDetails.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    funcList:['菜式','特色菜品','功效','人群'], //菜单分类
    menuList:[] //菜单列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title:'菜谱分类'
    })
    wx.showLoading({
      title: '加载数据中',
    })
    wx.cloud.callFunction({
      name:'getdata',
      data:{
        collectionName:'recipeType',
        where:{}
      }
    }).then(res=>{
      // console.log(res.result.data)
      let menuList =res.result.data;
      // console.log(menuList)
      menuList.forEach(item=>{
        item.show=false;
      })
      this.setData({
        menuList
      })
      for(let i in menuList) {
        wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
          if(res.intersectionRatio>0) {
            menuList[i].show=true;
          }
          this.setData({
            menuList
          })
        })
      }
      wx.hideLoading({})
    }).catch(err=>{
      console.log(err)
      wx.hideLoading({
        success: (res) => {
          wx.showToast({
            title: '无法获取菜单列表数据',
            icon:"none"
          })
        },
      })
    })
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
  //跳往搜索页面
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //跳往分类好的菜谱列表页面
  todishDetails(e) {
    // console.log(e.currentTarget.dataset.title)
    wx.navigateTo({
      url: `/pages/dishDetails/dishDetails?name=${e.currentTarget.dataset.title}`,
    })
  }
})