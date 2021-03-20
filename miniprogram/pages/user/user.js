// miniprogram/pages/user/user.js
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:true,
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //当加载这个页面时，判断本地缓存中有没有用户数据，有就自动登录
    //检查是否登录过期
    let isLogin=wx.getStorageSync('isLogin')|| false;
    if(isLogin) {
      wx.checkSession({
        success:res=>{
          let userInfo=wx.getStorageSync('userInfo');
          this.setData({
            userInfo,
            isLogin:true
          })
        }
      })
    }else {
      this.setData({
        isLogin:false
      })
    }
  },
  onShow: function () {
    let isLogin=wx.getStorageSync('isLogin')|| false;
    if(isLogin) {
      let userInfo=wx.getStorageSync('userInfo');
      this.setData({
        userInfo
      })
    }
  },
  //用户点击登录
  //使用 button 组件，并将 open-type 指定为 getUserInfo 类型，
  //当用户点击允许授权后，才可以获取用户基本信息到getuser函数中的e中
  getuserInfo(e) {
    // console.log(e); //e.detail.userInfo里也有用户信息，但调用login云函数才能获得appid和openid
    //此时表示用户没有允许授权
    if(e.detail.errMsg=="getUserInfo:fail auth deny") {
      wx.showToast({
        title:"您需要授权，才能使用所有功能",
        icon:"none"
      })
      return false;
    }
    let userInfo=e.detail.userInfo;
    // //同意授权 res.result装的是appid和openid appid是小程序的标志，openid是用户的标志
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      if(res.result.appid) {
        let openid=res.result.openid;
        wx.setStorageSync('appid',res.result.appid);
        wx.setStorageSync('openid', openid);
        wx.login({}); //调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成。
        db.collection("user").where({
          openid
        }).get().then(res=>{
          // console.log(res.data.length)
          if(res.data.length==0) {
            let record={
              nickName:userInfo.nickName,
              avatarUrl:userInfo.avatarUrl,
              country:userInfo.country,
              userInfo:"",
              gender:userInfo.gender,
              fans:0,
              knows:0,
              openid
            }
            wx.cloud.callFunction({
              name:"add",
              data:{
                collectionName:"user",
                data:record
              }
            }).then(res=>{
              // console.log(res)
              this.setData({
                isLogin:true,
                userInfo
              })
            })
          }else {
            // console.log(res.data[0])
            wx.setStorageSync('userInfo', res.data[0])
            wx.setStorageSync('isLogin', true)
            this.setData({
              isLogin:true,
              userInfo:res.data[0]
            })
          }
        })
      }
    })
    },
    //跳往发布菜谱页面
    toAdd() {
      wx.switchTab({
        url: '/pages/add/add',
      })
    },
    //跳往用户信息页面
    toUserinfo() {
      wx.navigateTo({
        url: '/pages/userInfo/userInfo',
      })
    },
    //跳往收藏或我的菜谱页面
    toHouseDetail(e) {
      // console.log(e.currentTarget.dataset.index)
      wx.navigateTo({
        url: `/pages/cookDetail/cookDetail?index=${e.currentTarget.dataset.index}`,
      })
    },
    //跳往个人信息中心
    toUserDetail() {
      wx.navigateTo({
        url: '/pages/userDetail/userDetail',
      })
    },
    //退出登录
    quitLogin() {
      this.setData({
        isLogin:false
      })
      wx.setStorageSync('isLogin', false)
      wx.setStorageSync('userInfo', '')
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