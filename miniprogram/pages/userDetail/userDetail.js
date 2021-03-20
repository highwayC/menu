const water=require("../../api/waterFall")
const show=require("../../api/lazyLoad");
const tool = require("../../api/tool");
const db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_active:0,
    screenHeight:0, //屏幕的高度
    //菜谱栏
    page1:0,  //从数据库获取出的数据的页码数
    loading1: true,  //加载的图标是否展示出来
    isAllLoaded1: false, //全部加载完成的图标是否展示出来
    Allheight1:0, //所有数据的总高度
    col1H:0,  //第一列所展示出的数据的总高度
    col2H:0,  //第二列所展示出的数据的总高度
    col1: [],  //菜谱第一列存的数据
    col2: [],  //菜谱第二列存的数据
    // 收藏夹
    page2:0,  //从数据库获取出的数据的页码数
    loading2: true,  //加载的图标是否展示出来
    isAllLoaded2: false, //全部加载完成的图标是否展示出来
    Allheight2:0, //所有数据的总高度
    col1HTwo:0,  //第一列所展示出的数据的总高度
    col2HTwo:0,  //第二列所展示出的数据的总高度
    col1Two: [],  //菜谱第一列存的数据
    col2Two: [],  //菜谱第二列存的数据
    isTwo:false, //判断收藏夹是否展示过

    initTop:0,  //最初菜单栏距离顶部的高度
    hasOne:true,
    hasTwo:true,

    user:"",  //用户详细信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenHeight =  wx.getSystemInfoSync().screenHeight + 30
    let col1 = [];
    let col2 = [];
    let col1H=0,col2H=0;
    let openid = wx.getStorageSync('openid')
    db.collection('user').where({openid:openid}).get().then(res=>{
      // console.log(res.data[0])
      this.setData({
        screenHeight,
        user:res.data[0]
      })
    })
    water.loadData({openid:openid},col1,col2,col1H,col2H).then(result=>{
      if(result.Allheight>0) {
        this.setData({
          col1:result.col1,
          col2:result.col2,
          col1H:result.col1H,
          col2H:result.col2H,
          Allheight1:result.Allheight,
          isAllLoaded1:result.loading
        })
        show.showImg('#item',this.data.col1,this.data.screenHeight,'.item-0',this).then(res=>{
          this.setData({
            col1:res
          })
        })
        show.showImg('#item',this.data.col2,this.data.screenHeight,'.item-1',this).then(res=>{
          this.setData({
            col2:res
          })
        })
      }else {
        this.setData({
          hasOne:false,
          loading1:false,
          Allheight1:230,
        })
      }
    })
  },
  //页面滚动时触发
  onPageScroll:tool.throttle((res,that)=>{
    show.showImg('#item',that.data.col1,that.data.screenHeight,'.item-0',that).then(res=>{
      that.setData({
        col1:res
      })
    })
    show.showImg('#item',that.data.col2,that.data.screenHeight,'.item-1',that).then(res=>{
      that.setData({
        col2:res
      })
    })
    show.showImg('#item1',that.data.col1Two,that.data.screenHeight,'.item-2',that).then(res=>{
      that.setData({
        col1Two:res
      })
    })
    show.showImg('#item1',that.data.col2Two,that.data.screenHeight,'.item-3',that).then(res=>{
      that.setData({
        col2Two:res
      })
    })
    //以下的方法实现不了，在安卓机上也是卡的一匹，安卓机的计算实在太复杂太慢了
    // console.log(res.scrollTop)
    //判断'滚动条'滚动的距离 和 '元素在初始时'距顶部的距离进行判断
    // let isFixed = res.scrollTop >= that.data.initTop ? true : false;
    // //为了防止不停的setData, 这儿做了一个等式判断。 只有处于吸顶的临界值才会不相等
    // if (that.data.isFixed === isFixed) {
    //   return false;
    // }
    // that.setData({
    //   isFixed
    // });
  }),
  // 上拉触底时触发
  onReachBottom: function() {
    if(this.data.is_active==0) {
      //手指上拉，会触发多次 onReachBottom，应为一次上拉，只触发一次  
      if (this.data.isAllLoaded1) return;  
      let page1=this.data.page1+1;
      this.setData({ 
        loading1: true,
        page1
      });
      let col1 = this.data.col1;
      let col2 = this.data.col2;
      let col1H=this.data.col1H,col2H=this.data.col2H;
      let openid=wx.getStorageSync('openid')
      water.reachBottom({openid:openid},col1,col2,col1H,col2H,page1).then(result=>{
        this.setData({
          col1:result.col1,
          col2:result.col2,
          col1H:result.col1H,
          col2H:result.col2H,
          Allheight1:result.Allheight,
          isAllLoaded1:result.isAllLoaded,
          loading1:false
        })
      })
    }else {
      //手指上拉，会触发多次 onReachBottom，应为一次上拉，只触发一次  
      if (this.data.isAllLoaded2) return;  
      let page2=this.data.page2+1;
      this.setData({ 
        loading2: true,
        page2
      });
      let col1 = this.data.col1Two;
      let col2 = this.data.col2Two;
      let col1H=this.data.col1HTwo,col2H=this.data.col2HTwo;
      let openid=wx.getStorageSync('openid')
      wx.cloud.callFunction({
        name:'getDoubleData',
        data:{
          collection:'house',
          from:'recipe',
          localField:'recipeid',
          foreignField:'_id',
          as:'recipeContent',
          match:{openid:openid},
          skip:page2*10
        },
        success:res=>{
          // console.log(res.result.list)
          let list=res.result.list
          if(list.length) {
            let loading=false;
            if(list.length<10) {
              loading=true;
            }
            list.forEach(item => {
              item = item.recipeContent[0]
              item.show=false;
              //根据图片的比例计算出图片的真实高度
              let width=item.width;
              let height=item.height;
              let scale = 350 / width; 
              let imgHeight= height*scale;
              item.width=350;
              item.height=imgHeight;
              //根据两列的现存高度计算出该条数据存在哪一列
              if (col1H <= col2H) {
                item.colH=col1H;
                col1H += imgHeight+125;
                col1.push(item);
              } else {
                item.colH=col2H;
                col2H += imgHeight+125;
                col2.push(item);
              }
            });
            let Allheight = col1H>=col2H? col1H:col2H;
            this.setData({
              col1Two:col1,
              col2Two:col2,
              col1HTwo:col1H,
              col2HTwo:col2H,
              Allheight2:Allheight,
              isAllLoaded2:loading,
              loading2:false
            })
            show.showImg('#item1',this.data.col1Two,this.data.screenHeight,'.item-2',this).then(res=>{
              this.setData({
                col1Two:res
              })
            })
            show.showImg('#item1',this.data.col2Two,this.data.screenHeight,'.item-3',this).then(res=>{
              this.setData({
                col2Two:res
              })
            })
          }
        }
      })
    }
  },
  //去往编辑资料页面
  toEditInfo(e) {
    // console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: `/pages/userInfo/userInfo?id=${e.currentTarget.dataset.user}`,
    })
  },
  //点击改变菜单栏内容
  changeMenu(e) {
    // console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    this.setData({
      is_active:index,
      isblack:false
    })
    if(index==1&&(!this.data.isTwo)) {
      let col1 = this.data.col1Two;
      let col2 = this.data.col2Two;
      let col1H=this.data.col1HTwo,col2H=this.data.col2HTwo;
      let openid = wx.getStorageSync('openid')
      //联表查询需要在云函数中运行，
      //联表查询作用：由于分步查询间存在异步，会导致每次查询结果的顺序都不一样，所以需要联表，一次性请求到数据的相关信息
      wx.cloud.callFunction({
        name:'getDoubleData',
        data:{
          collection:'house',
          from:'recipe',
          localField:'recipeid',
          foreignField:'_id',
          as:'recipeContent',
          match:{openid:openid},
          skip:0
        },
        success:res=>{
          // console.log(res.result.list)
          let list=res.result.list
          if(list.length==0) {
            this.setData({
              hasTwo:false,
              loading2:false,
              Allheight2:230,
            })
          }else{
            let loading=false;
            if(list.length<10) {
              loading=true;
            }
            list.forEach(item => {
              item = item.recipeContent[0]
              item.show=false;
              //根据图片的比例计算出图片的真实高度
              let width=item.width;
              let height=item.height;
              let scale = 350 / width; 
              let imgHeight= height*scale;
              item.width=350;
              item.height=imgHeight;
              //根据两列的现存高度计算出该条数据存在哪一列
              if (col1H <= col2H) {
                item.colH=col1H;
                col1H += imgHeight+125;
                col1.push(item);
              } else {
                item.colH=col2H;
                col2H += imgHeight+125;
                col2.push(item);
              }
            });
            let Allheight = col1H>=col2H? col1H:col2H;
            this.setData({
              col1Two:col1,
              col2Two:col2,
              col1HTwo:col1H,
              col2HTwo:col2H,
              Allheight2:Allheight,
              isAllLoaded2:loading,
              isTwo:true
            })
            show.showImg('#item1',this.data.col1Two,this.data.screenHeight,'.item-2',this).then(res=>{
              this.setData({
                col1Two:res
              })
            })
            show.showImg('#item1',this.data.col2Two,this.data.screenHeight,'.item-3',this).then(res=>{
              this.setData({
                col2Two:res
              })
            })
          }
        }
      })
    }
  },
  //菜单栏模块改变时
  changeSwiper(e) {
    // console.log(e.detail.current)
    this.setData({
      is_active:e.detail.current
    })
    if(!this.data.isTwo) {
      let col1 = this.data.col1Two;
      let col2 = this.data.col2Two;
      let col1H=this.data.col1HTwo,col2H=this.data.col2HTwo;
      let openid = wx.getStorageSync('openid')
      //联表查询需要在云函数中运行，
      //联表查询作用：由于分步查询间存在异步，会导致每次查询结果的顺序都不一样，所以需要联表，一次性请求到数据的相关信息
      wx.cloud.callFunction({
        name:'getDoubleData',
        data:{
          collection:'house',
          from:'recipe',
          localField:'recipeid',
          foreignField:'_id',
          as:'recipeContent',
          match:{openid:openid},
          skip:0
        },
        success:res=>{
          // console.log(res.result.list)
          let list=res.result.list
          if(list.length==0) {
            this.setData({
              hasTwo:false,
              loading2:false,
              Allheight2:230,
            })
          }else{
            let loading=false;
            if(list.length<10) {
              loading=true;
            }
            list.forEach(item => {
              item = item.recipeContent[0]
              item.show=false;
              //根据图片的比例计算出图片的真实高度
              let width=item.width;
              let height=item.height;
              let scale = 350 / width; 
              let imgHeight= height*scale;
              item.width=350;
              item.height=imgHeight;
              //根据两列的现存高度计算出该条数据存在哪一列
              if (col1H <= col2H) {
                item.colH=col1H;
                col1H += imgHeight+125;
                col1.push(item);
              } else {
                item.colH=col2H;
                col2H += imgHeight+125;
                col2.push(item);
              }
            });
            let Allheight = col1H>=col2H? col1H:col2H;
            this.setData({
              col1Two:col1,
              col2Two:col2,
              col1HTwo:col1H,
              col2HTwo:col2H,
              Allheight2:Allheight,
              isAllLoaded2:loading,
              isTwo:true
            })
            show.showImg('#item1',this.data.col1Two,this.data.screenHeight,'.item-2',this).then(res=>{
              this.setData({
                col1Two:res
              })
            })
            show.showImg('#item1',this.data.col2Two,this.data.screenHeight,'.item-3',this).then(res=>{
              this.setData({
                col2Two:res
              })
            })
          }
        }
      })
    }
  }
})