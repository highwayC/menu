// miniprogram/pages/search/search.js
const db=wx.cloud.database();
const process=require("../../api/processFood");
const show=require("../../api/lazyLoad");
const tool = require("../../api/tool");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dishList:[],
    recomList:[],  //推荐列表
    newList:[],   //最近搜索列表
    value:'',
    isDetail:false,  //是否是详细信息
    otherText:'',   //是否展示信息
    loading:false,
    isAllLoaded:false,
    page:0,
    height:0,   //菜谱的高度
    screenHeight:0,  //页面的可视高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenHeight = wx.getSystemInfoSync().screenHeight

    let newList=wx.getStorageSync('newList')||[]
    if(newList.length>10)
      newList.slice(0,10); //截取前10个

    wx.setStorageSync('newList', newList)
    db.collection('recipe').orderBy('collects','desc').limit(8).get().then(res=>{
      res.data.forEach(item=>{
        this.data.recomList.push(item.dishName)
      })
      this.setData({
        screenHeight,
        newList,
        recomList:this.data.recomList
      })
      // console.log(this.data.recomList)
    })
  },
  goBack() {
    wx.navigateBack({});
  },
  //往搜索框输入内容时,判断输入内容为0时，就显示热门推荐和最近搜索
  Input(e) {
    // console.log(e.detail.value)
    if(e.detail.value.length===0) {
      this.setData({
        isDetail:false,
        otherText:''
      })
    }else {
      this.setData({
        isDetail:true,
        otherText:'',
        dishList:[]
      })
    }
  },
  //点击清除×时，删除input里的value值
  clearContent(){
    this.setData({
      value:'',
      isDetail:false
    })
  },
  //点击完成按钮时，得到搜索结果信息
  search(e) {
    this.searchProcess(e.detail.value);
  },
  //点击热门推荐时
  toSearch(e) {
    // console.log(e.currentTarget.dataset.name)
    this.setData({
      value:e.currentTarget.dataset.name
    })
    this.searchProcess(e.currentTarget.dataset.name)
  },
  searchProcess(name) {
    wx.showLoading({
      title: '正在搜索中...',
    })
    db.collection('recipe').where({
      dishName:{         //dishName为集合中的字段名，要对哪个字段进行模糊搜索就写哪个字段名
        $regex:'.*' + name + '.*',  //e.detail.value为搜索框输入的值
        $options: 'i' 
      },
    }).get().then(res=>{
      wx.hideLoading({})
      if(res.data.length===0) {
        this.setData({
          dishList:[],
          isDetail:true,
          otherText:"暂无更多相关菜谱，请搜索其他菜谱~"
        })
      }else {
        let result = process.processFood(res.data)
        this.setData({
          dishList:result,
          height:result.length*(180+12),
          value:name,
          isDetail:true
        })
        show.showImg('#search',result,this.data.screenHeight,'.item-3',this).then(res=>{
          this.setData({
            dishList:res
          })
        })
      }
      // console.log(this.data.dishList)
    }) 
    // 将搜索过的内容存在最近搜索中
    let newList=wx.getStorageSync('newList')||[]
    let num=newList.indexOf(name)
    //如果搜索内容已经在最近搜索中
    if(num!=-1){
      newList.splice(num,1);
    }
    newList.unshift(name);
    if(newList.length>10)
      newList.slice(0,10); //截取前10个
    this.setData({
      newList
    })
    wx.setStorageSync('newList', newList)
  },
  //点击最近搜索时，得到搜索结果信息，并待变最近搜索内容的顺序
  search_new(e) {
    wx.showLoading({
      title: '正在搜索中...',
    })
    let value=e.currentTarget.dataset.item;
    db.collection('recipe').where({
      dishName:{         //dishName为集合中的字段名，要对哪个字段进行模糊搜索就写哪个字段名
        $regex:'.*' + value + '.*',  //e.detail.value为搜索框输入的值
        $options: 'i' 
      },
    }).limit(10).get().then(res=>{
      // console.log(res)
      wx.hideLoading({})
      if(res.data.length==0) {
        this.setData({
          dishList:[],
          value,
          isDetail:true,
          otherText:"暂无更多相关菜谱，请搜索其他菜谱~"
        })
      }else {
        let result = process.processFood(res.data)
        this.setData({
          dishList:result,
          value,
          height:result.length*(180+12),
          isDetail:true
        })
        show.showImg('#search',this.data.dishList,this.data.screenHeight,'.item-3',this).then(res=>{
          this.setData({
            dishList:res
          })
        });
      }
    }) 
    let index=e.currentTarget.dataset.index;
    // console.log(index)
    let newList=this.data.newList;
    newList.splice(index,1);
    newList.unshift(value);
    this.setData({
      newList
    })
    wx.setStorageSync('newList', newList)
  },
  //删除一个最近搜索内容
  delete(e) {
    // console.log(e.currentTarget.dataset.index)
    let newList=this.data.newList;
    newList.splice(e.currentTarget.dataset.index,1);
    this.setData({
      newList
    })
    wx.setStorageSync('newList', newList)
  },
  //删除所有的最近搜索
  deleteAll() {
    wx.showModal({
      content: '确定清除所有历史记录吗？', 
      success: (res)=>{
        if (res.confirm) {//这里是点击了确定以后
          this.setData({
            newList:[]
          })
          wx.setStorageSync('newList', [])
        }  
      } 
    })
  },
  //跳往菜谱详情页面
  toDetails(e) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}`,
    })
  },
  //页面滚动时触发
  onPageScroll:tool.throttle((res,that)=>{
    show.showImg('#search',that.data.dishList,that.data.screenHeight,'.item-3',that).then(res=>{
      that.setData({
        dishList:res
      })
    });
  }),
  //上拉触底时触发
  onReachBottom: function () {
    if (this.data.isAllLoaded) return;  
    let page=this.data.page+1;
    this.setData({ 
      loading: true,
      page
    });  
    let isAllLoaded=false;
    let value=this.data.value;
    setTimeout(()=>{
      db.collection("recipe").where({
        dishName:{         //dishName为集合中的字段名，要对哪个字段进行模糊搜索就写哪个字段名
          $regex:'.*' + value + '.*',  //value为搜索框输入的值
          $options: 'i' 
        },
      }).skip(page*10).limit(10).get().then(res=>{
        if(res.data.length===0) {
          isAllLoaded=true;
          this.setData({
            loading:false,
            isAllLoaded,
          })
        }else {
          let result = process.processFood(res.data)
          let dishList=this.data.dishList;
          result.forEach(item=>{
            dishList.push(item)
          })
          this.setData({
            dishList,
            height:dishList.length*(180+12),
            isAllLoaded,
            loading:false,
          })
        }
      })
    },200)
  }
})