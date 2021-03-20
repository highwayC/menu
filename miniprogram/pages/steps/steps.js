// miniprogram/pages/steps/steps.js
const img=require("../../api/selectImg");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepsList:[{Img:"",message:"",isPic: false,}], //步骤集合
    max:200,  //步骤描述最多能容纳的字数
    currentWordNumber:[0,], //所有步骤当前字数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.stepsList) {
      let stepsList= JSON.parse(options.stepsList)
      this.setData({
        stepsList
      })
    }

  },
  // 点击添加下一个步骤
  addNext() {
    this.data.stepsList.push({Img:"",message:"",isPic:false});
    this.data.currentWordNumber.push(0);
    this.setData({
      stepsList:this.data.stepsList
    })
  },
  //点击选择图片
  selectPic(e) {
    //e.currentTarget.dataset和e.target.dataset都能找到num，
    //但有时候e.target.dataset显示的是undefined
    let {num}=e.currentTarget.dataset;
    img.uploadImage().then(res=>{
      // console.log(res)
      this.data.stepsList[num]["Img"]=res[0];
      this.data.stepsList[num]["isPic"]=true;
      this.setData({
        stepsList:this.data.stepsList,
      })
    }).catch(err=>{
      wx.showToast({
        title: '上传失败',
        icon:"none"
      })
    });
  },
  //记录输入的文字
  stepMessage(e) {
    let {num}=e.target.dataset;
    let value=e.detail.value;
    let len=parseInt(value.length);
    if(len<=this.data.max) {
      this.data.currentWordNumber[num]=len;
      this.data.stepsList[num]["message"]=e.detail.value;
      this.setData({
        currentWordNumber:this.data.currentWordNumber,
        stepsList:this.data.stepsList
      })
    }
  },
  // 删除该步骤
  stepDelete(e) {
    let {num}=e.target.dataset;
    this.data.stepsList.splice(num,1);
    this.setData({
      stepsList:this.data.stepsList,
    })
  },
  //点击取消按钮时，stepsList清0，并且返回上一层
  stepCancel() {
    this.data.stepsList=[];
    this.setData({
      stepsList:this.data.stepsList,
    })
    wx.navigateBack({});
  },
  //点击确认按钮时
  stepEnsure() {
    let flag=0; //检测是否有步骤是空白的
    this.data.stepsList.forEach(item => {
      if(!item.Img) {
        wx.showToast({
          title: '有步骤没填完',
        })
        flag=1;
      }
    });
    if(flag) {
      return;
    }
    //通过从页面路由栈中直接获取和操作目标Page对象，从而调用该page对象中的方法
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      stepsList:currPage.data.stepsList
    })
    wx.navigateBack({});
  }
})