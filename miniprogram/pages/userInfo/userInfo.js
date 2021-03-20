// miniprogram/pages/userInfo/userInfo.js
const api=require("../../api/compresss");
const img=require("../../api/selectImg");
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isCover:false,
    genderArray:['男','女'],  //性别列表
    genderIndex:0,  //性别序号
    width:0,
    height:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let openid = wx.getStorageSync('openid')
    db.collection('user').where({openid:openid}).get().then(res=>{
      let genderIndex = 0
      if(res.data[0].gender===2) {
        genderIndex = 1
        this.setData({
          genderIndex,
          userInfo:res.data[0]
        })
      }
    })
  },
  //更换头像
  changePic(e) {
    let index = e.currentTarget.dataset.index
    let openid=wx.getStorageSync('openid')
    img.uploadImage().then(res=>{
      wx.getImageInfo({ 
        src: res[0], 
        success: res=>{ 
            this.setData({
              height:res.height,
              width:res.width
            })
        } 
      })
      api.urlTobase64Fn(res).then(ret=>{
          ret[0]=ret[0].substring(ret[0].indexOf(',')+1);
            // console.log(res)
          this.uploadCloud([ret[0]]).then(re=>{
            // console.log(re[0])
            if(index==1) {
              let userInfo=wx.getStorageSync('userInfo')
              userInfo.avatarUrl=re[0];
              wx.setStorageSync('userInfo', userInfo)
              this.setData({
                userInfo
              })
              wx.cloud.callFunction({
                name:"update",
                data:{
                  collectionName:"user",
                  where:{
                    openid
                  },
                  content:{
                    data:{
                      avatarUrl:re[0]
                    }
                  }
                }
              })
              wx.cloud.callFunction({
                name:"update",
                data:{
                  collectionName:"recipe",
                  where:{
                    openid
                  },
                  content:{
                    data:{
                      userImg:re[0]
                    }
                  }
                }
              })
            }else {
              wx.cloud.callFunction({
                name:"update",
                data:{
                  collectionName:"user",
                  where:{
                    openid
                  },
                  content:{
                    data:{
                      bg:re[0]
                    }
                  }
                }
              })
            }
          })
      }) 
    });
  },
  //上传文件到云存储
  uploadCloud:function(base64Arr) {
    return new Promise((resolve,reject)=>{
      let fileID=[];
      base64Arr.forEach(item=>{
        wx.cloud.callFunction({
          name:"uploadFile",
          data:{
            base64Data:item
          }
        }).then(res=>{
          //res.result.fileID就是云函数返回的fileid
          fileID.push(res.result.fileID);
          // console.log(fileID)
          if(fileID.length>=base64Arr.length) {
            resolve(fileID);
          }
        }).catch(err=>{
          wx.showToast({
            title: '图片上传失败',
          })
        })
      })
    })
  },
  //修改性别的位置序号
  bindPickerChange(e) {
    // console.log(e)
    let gender = parseInt(e.detail.value) + 1
    // console.log(gender)
    if(gender != this.data.userInfo.gender) {
      this.data.userInfo.gender=gender
      this.setData({
        genderIndex:e.detail.value,
        userInfo:this.data.userInfo
      })
      let openid = wx.getStorageSync('openid')
      wx.cloud.callFunction({
        name:"update",
        data:{
          collectionName:"user",
          where:{
            openid
          },
          content:{
            data:{
              gender:gender
            }
          }
        }
      })
    }
  },
  //去往修改国家的页面
  toCountry() {
    wx.navigateTo({
      url: `/pages/country/country?country=${this.data.userInfo.country}`,
    })
  },
  //去往修改简介的页面
  toEditInfo(e) {
    // console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    if(index===1) {
      wx.navigateTo({
        url: `/pages/editInfo/editInfo?nickname=${this.data.userInfo.nickName}&index=${index}`,
      })
    }else {
      wx.navigateTo({
        url: `/pages/editInfo/editInfo?userinfo=${this.data.userInfo.userInfo}&index=${index}`,
      })
    }
  }
})