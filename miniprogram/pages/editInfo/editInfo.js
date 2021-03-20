// miniprogram/pages/editInfo/editInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count:20, //固定字数
    currentWordNumber:20, //可以容纳的字数
    isDisabled:true,  //是否禁用按钮
    content:'',  //输入的内容
    index:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.userinfo)
    let content,count=20;
    if(options.index==1) {
      content = options.nickname
    } else {
     content = options.userinfo;
     count=40;
    }
    let num = count - content.length
    this.setData({
      content,
      currentWordNumber:num,
      index:options.index,
      count
    })
  },
  //记录输入的文字
  stepMessage(e) {
    let value=e.detail.value;
    let count=this.data.count;
    let len=parseInt(value.length);
    if(len<=count) {
      this.data.currentWordNumber=count-len;
      this.setData({
        currentWordNumber:this.data.currentWordNumber,
        content:value,
        isDisabled:false
      })
    }
  },
  //改变简介或昵称内容
  changeInfo() {
    //通过从页面路由栈中直接获取和操作目标Page对象，从而调用该page对象中的方法
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    let openid = wx.getStorageSync('openid')
    if(this.data.index==1) {
      prevPage.data.userInfo.nickName = currPage.data.content;
      wx.cloud.callFunction({
        name:"update",
        data:{
          collectionName:"user",
          where:{
            openid
          },
          content:{
            data:{
              nickName:currPage.data.content
            }
          }
        }
      })
    }else {
      prevPage.data.userInfo.userInfo = currPage.data.content;
      wx.cloud.callFunction({
        name:"update",
        data:{
          collectionName:"user",
          where:{
            openid
          },
          content:{
            data:{
              userInfo:currPage.data.content
            }
          }
        }
      })
    }
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      userInfo:prevPage.data.userInfo
    })
    wx.navigateBack({});
  }
})