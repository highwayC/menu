// miniprogram/pages/cookDetail/cookDetail.js
const db=wx.cloud.database();
const process=require("../../api/processFood");
let startTouchX = 0; //开始触摸到屏幕的距离 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    likeList:[], //收藏列表
    isLike:true,   //判断是否有数据
    isOpen:false,  //判断是否移动开显示删除标志
    deleteIndex:0, //要删除的元素的序号
    showIndex:'',  //展示的模块
    showWord:'',  //展示的文字
    page:0,   //加载的页面
    loading: false,  //加载的图标是否展示出来
    isAllLoaded: false, //全部加载完成的图标是否展示出来
    height:0,   //总高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openid=wx.getStorageSync('openid');
    this.setData({
      showIndex:options.index
    })
    if(options.index=="1") {
      wx.showLoading({
        title: '正在加载中...',
      })
      db.collection("recipe").where({
        openid:openid
      }).limit(10).get().then(res=>{
        if(res.data.length) {
          let result = process.processFood(res.data)
          let isAllLoaded = false
          if(res.data.length<10) {
            isAllLoaded = true
          }
          this.setData({
            isAllLoaded,
            likeList:result,
            height:result.length*180
          })
          for(let i in result) {
            wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(ress)=>{
              if(ress.intersectionRatio>0) {
                result[i].show=true;
              }
              this.setData({
                likeList:result
              })
            })
          }
        }else {
          this.setData({
            isLike:false,
            showWord:'快去发布菜谱吧~'
          })
        }
        wx.hideLoading({})
      })
    }else if(options.index=="2") {
      wx.showLoading({
        title: '正在加载中...',
      })
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
          if(res.result.list) {
            let likeList=[];
            let len=res.result.list.length
            let isAllLoaded = false
            if(len<10) {
              isAllLoaded = true
            }
            res.result.list.forEach((item,index)=>{
              let result = process.processFood(item.recipeContent)
              likeList.push(result[0])   
              if(likeList.length===len) {
                // console.log(likeList)
                this.setData({
                  likeList,
                  isAllLoaded,
                  height:len*180
                })
                for(let i in likeList) {
                  wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
                    if(res.intersectionRatio>0) {
                      likeList[i].show=true;
                    }
                    this.setData({
                      likeList
                    })
                  })
                }
              }  
            })
          }else {
            this.setData({
              showWord:'快去加入收藏夹吧~',
              isLike:false
            })
          }
          wx.hideLoading({})
        }
      })
    }
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
  //开始移动时触发
  startMove(e){
    startTouchX = e.changedTouches[0].pageX;
  },
  //结束移动后触发
  endMove(e) {
    let endTouchX = e.changedTouches[0].pageX;
    let change = endTouchX - startTouchX;
    // console.log(change)
    let deleteIndex = e.currentTarget.dataset.index;
    if(change<-65) {
      this.setData({
        isOpen:true,
        deleteIndex
      })
    }else if(change>50) {
      this.setData({
        isOpen:false,
        deleteIndex
      })
    }else {
      this.setData({
        isOpen:this.data.isOpen,
        deleteIndex
      })
    }
  },
  //删除菜单
  deleteDish(e){
    // console.log("111")
    let id = e.currentTarget.dataset.id
    let index= e.currentTarget.dataset.index;
    //console.log(id)
    let showIndex=this.data.showIndex;
    let collectionName='';
    let where={};
    if(showIndex=="1") {
      collectionName='recipe';
      where={
        _id:id
      }
    }else {
      collectionName="house"
      where={
        recipeid:id
      }
    }
    wx.cloud.callFunction({
      name: 'delete',
      data:{
        collectionName,
        where
      },
      complete: res => {
        console.log(res)
        let likeList=this.data.likeList;
        likeList.splice(index,1)
        this.setData({
          likeList,
          isOpen:false,
          height:this.data.height-180
        })
        wx.showToast({
          title: '删除收藏成功',
          icon: 'success',
        })
      }
    })
  },
  //跳往菜单详细页面
  toDetails(e) {
    // console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}`,
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //手指上拉，会触发多次 onReachBottom，应为一次上拉，只触发一次
    if (this.data.isAllLoaded) return;  
    let page=this.data.page+1;
    let openid=wx.getStorageSync('openid');
    this.setData({ 
      loading: true,
      page
    });  
    let isAllLoaded=false;
    setTimeout(() => {
      if(this.data.showIndex=="1") {
        let openid=wx.getStorageSync('openid');
        db.collection("recipe").where({
          openid:openid
        }).skip(page*10).limit(10).orderBy("_id","desc").get().then(res=>{
          // console.log(res)
          if(res.data.length==0) {
            isAllLoaded=true;
            this.setData({
              loading:false,
              isAllLoaded,
            })
          }else {
            let result = process.processFood(res.data)
            let likeList=this.data.likeList
            //不能用concat连接两个数组，会造成页面无法渲染出
            result.forEach(item=>{
              likeList.push(item)
            })
            this.setData({
              likeList,
              height:likeList.length*180,
              isAllLoaded,
              loading:false,
            })
            for(let i in likeList) {
              wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
                if(res.intersectionRatio>0) {
                  likeList[i].show=true;
                }
                this.setData({
                  likeList
                })
              })
            }
          }
        })
      }else {
        wx.cloud.callFunction({
          name:'getDoubleData',
          data:{
            collection:'house',
            from:'recipe',
            localField:'recipeid',
            foreignField:'_id',
            as:'recipeContent',
            match:{openid:openid},
            skip:page*10
          },
          success:res=>{
            // console.log(res.result.list)
            let len=res.result.list.length;
            if(len==0) {
              isAllLoaded=true;
              this.setData({
                loading:false,
                isAllLoaded,
              })
          }else {
            let likeList=this.data.likeList;
            let len=res.result.list.length+likeList.length;
            res.result.list.forEach((item,index)=>{
            let result = process.processFood(item.recipeContent)
              likeList.push(result[0])   
              if(likeList.length==len) {
                // console.log(likeList)
                this.setData({
                  likeList,
                  height:likeList.length*180,
                  isAllLoaded,
                  loading:false,
                })
                for(let i in likeList) {
                  wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
                    if(res.intersectionRatio>0) {
                      likeList[i].show=true;
                    }
                    this.setData({
                      likeList
                    })
                  })
                }
              }  
            })
          }
          }
        })
      }
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})