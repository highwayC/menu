// miniprogram/pages/add/add.js
const api=require("../../api/compresss");
const img=require("../../api/selectImg");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPic:false, //是否有成品图了
    workPic:[],  //成品图
    array: ['',], //菜谱的类型
    Index: 0,    //选择的菜谱类型的下标
    FoodList:[], //该菜谱所需的用料
    isFood:false,  //是否显示添加用料层
    blockValue:'',  //用料层的值
    stepsList:[],
    isLogin:true,  //是否登录
    width:0,
    height:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isLogin=wx.getStorageSync('isLogin')||false;
    this.setData({
      isLogin
    })
    wx.cloud.callFunction({
      name:"getdata",
      data:{
        collectionName:"recipeType",
        where:{}
      }
    }).then(res=>{
      // console.log(res)
      res.result.data.forEach(item=>{
        this.data.array.push(item.recipeTypeName)
      })
      this.setData({
        array:this.data.array
      })
    })
  },
  onShow: function () {
    let isLogin=wx.getStorageSync('isLogin')||false;
    this.setData({
      isLogin
    })
  },
  //点击选择图片
  //直接使用chooseImage()函数时，小程序直接进入相机拍摄，无法选择手机相册，因此使用showActionSheet调出操作选择菜单，
  //根据用户选择，在chooseImage函数中的sourceType中传入单一参数值，
  //不管是相册选择还是手机拍照，chooseImage都会返回图片路径，直接在url中调用路径就可以显示图片。
  selectPic(e) {
    img.uploadImage().then(res=>{
      // console.log(res)
      this.setData({
        workPic:res[0],
        isPic:true
      })
    });
  },
  //选择菜谱类型
  bindPickerChange: function (e) {
    // console.log('picker下拉项发生变化后，下标为：', e.detail.value)
    this.setData({
        Index: e.detail.value
    })
  },
  //记录输入的用料名
  blockSubmit(e) {
    // console.log(e.detail.value)
    let {foodName,count}=e.detail.value;
    if(!foodName||!count) {
      wx.showToast({
        title: '用料或用量不能为空哦',
        icon:"none"
      })
    }else {
      this.data.FoodList.push(e.detail.value)
      this.setData({
        FoodList:this.data.FoodList,
        isFood:false,
        blockValue:''
      })
    }
  },
  //点击+，显示用料层
  addFood() {
    // console.log('111')
    this.setData({
      isFood:true
    })
  },
  //点击×，隐藏用料层
  blockclear() {
    // console.log("111")
    this.setData({
      isFood:false,
      blockValue:''
    })
  },
  //把该用料删除
  deleteFood(e) {
    // console.log(e.target.dataset)
    let {num}=e.target.dataset;
    this.data.FoodList.splice(num,1);
    this.setData({
      FoodList:this.data.FoodList
    })
  },
  //去往编辑做法页面
  Tosteps() {
    if(!this.data.stepsList.length) {
      wx.navigateTo({
        url: '/pages/steps/steps',
      })
    }else {
      //将数组变成json格式字符串才能成为参数传送过去，不然传送的只是[object object]，无法得到数组
      let stepsList = JSON.stringify(this.data.stepsList)
      wx.navigateTo({
        url: `/pages/steps/steps?stepsList=${stepsList}`,
      })
    }
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
          console.log(fileID)
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
  //上传数据到数据库中
  async submit(e) {
    console.log(e)
    if(!e.detail.value.dishName) {
      wx.showToast({
        title: '标题不能为空',
        icon:"none"
      })
      return;
    }else if(!this.data.workPic) {
      wx.showToast({
        title: '成品图不能为空',
        icon:"none"
      })
      return;
    }else if(!this.data.Index) {
      wx.showToast({
        title: '菜谱类型不能为空',
        icon:"none"
      })
      return;
    }else if(!this.data.FoodList.length) {
      wx.showToast({
        title: '用料不能为空',
        icon:"none"
      })
      return;
    }else if(!this.data.stepsList.length) {
      wx.showToast({
        title: '做法步骤不能为空',
        icon:"none"
      })
      return;
    }else if(e.detail.value.dishName.length>10) {
      wx.showToast({
        title: '标题超过10字，请修改！',
        icon:"none"
      })
      return;
    }
    wx.showLoading({
      title: '正在上传中...',
    })
    let record ={};
    let userInfo=wx.getStorageSync('userInfo');
    let openid=wx.getStorageSync('openid')
    record['like']=0;
    record['collects']=0;
    record['username']=userInfo.nickName;
    record['userImg']=userInfo.avatarUrl;
    record['openid']=openid;
    record['dishName']=e.detail.value.dishName;
    record['type']=this.data.array[this.data.Index];
    let workPic=this.data.workPic;
    wx.getImageInfo({ 
      src: workPic, 
      success: res=>{ 
          record['width']=res.width;
          record['height']=res.height;
          this.setData({
            height:res.height,
            width:res.width
          })
      } 
    })
    let fileID=api.urlTobase64Fn([workPic]);
    fileID.then(res=>{
      // console.log(res)
      res[0]=res[0].substring(res[0].indexOf(',')+1);
      this.uploadCloud([res[0]]).then(ret=>{
        // console.log(ret)
        record['Pic']=ret[0];
      }).then(()=>{
        record['food']=this.data.FoodList;
        let stepsList=this.data.stepsList;
        let num=0;
        stepsList.forEach(async item=>{
          wx.getImageInfo({ 
            src: item.Img, 
            success: res=>{ 
                this.setData({
                  height:res.height,
                  width:res.width
                })
            } 
          })
          let fileID=api.urlTobase64Fn([item.Img]);
          fileID.then(res=>{
            // console.log(res)
            res[0]=res[0].substring(res[0].indexOf(',')+1);
            this.uploadCloud([res[0]]).then(ret=>{
              item.Img=ret[0];
              num++;
              if(num===stepsList.length) {
                record['steps']=stepsList;
                // console.log(record);
                wx.cloud.callFunction({
                  name:"add",
                  data:{
                    collectionName:"recipe",
                    data:record
                  }
                }).then(res=>{
                  wx.hideLoading({
                    success: (res) => {
                      this.setData({
                        value:'',
                        FoodList:[],
                        workPic:'',
                        stepsList:[],
                        Index:0,
                        isPic:false
                      })
                      wx.showToast({
                        title: '上传成功',
                        success:res=>{
                          wx.navigateTo({
                            url: '/pages/cookDetail/cookDetail?index=1',
                          })
                        }
                      })
                      },
                    })
                  })
                }
              })
            })   
          });
        })
    })  
  },
})