// miniprogram/pages/detail/detail.js
const db=wx.cloud.database();
const processTime = require("../../api/processTime");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:{},
    height:[],  //每个步骤的高度
    BigList:[],  //做法步骤的图片列表，放大时使用
    ImgList:[],  //用来判断懒加载
    isLike:false,  //是否已标志喜欢
    isHouse:false,  //是否已收藏
    showInput:false,  //是否展示输入框
    inputTop:0,  //输入框距离顶部的高度
    inputValue:'',  //输入的值
    commentIndex:0,   //评论的位置序号
    commentList:[],  //评论列表
    id:'',   //当前追加留言的id
    num:0,   //当前追加评论的序号
    allCommentHeight:0,  //评论的高度
    loading:false,
    isAllLoaded:false,
    page:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openid=wx.getStorageSync('openid')||'';
    let isLogin=wx.getStorageSync('isLogin')||false;
    wx.setNavigationBarTitle({
      title:options.name
    })  
    wx.showLoading({
      title: '正在加载中...',
    })
    db.collection('recipe').where({_id:options.id}).get().then(res=>{
      // console.log(res.result.data)
      let result=res.data[0];
      this.setData({
        content:result
      })
      let ImgList=this.data.ImgList;
      let BigList=this.data.BigList;
      result.steps.forEach(item=>{
        BigList.push(item.Img)
        ImgList.push({Img:item.Img,show:false})
      })
      this.setData({
        ImgList
      })
      wx.hideLoading({})
      for(let i in ImgList) {
        wx.createIntersectionObserver().relativeToViewport({bottom:20}).observe('.item-'+i,(res)=>{
          if(res.intersectionRatio>0) {
            ImgList[i].show=true;
          }
          this.setData({
            ImgList
          })
        })
      }
      if(isLogin) {
        db.collection('like').where({
          openid:openid,
          recipeid:result._id
        }).get().then(res=>{
          if(res.data.length!=0) {
            this.setData({
              isLike:true
            })
          }
          db.collection('house').where({
            openid:openid,
            recipeid:result._id
          }).get().then(res=>{
            if(res.data.length!=0) {
              this.setData({
                isHouse:true
              })
            }
          })
        })
      }
    }).then(res=>{
      db.collection('comment').where({recipeId:options.id}).limit(10).orderBy('commentTime','desc').get().then(res=>{
        // console.log(res.data)
        res.data.forEach((item,index) =>{
          item.commentTime = processTime.timeHandle(item.commentTime)
          if(isLogin) {
            db.collection('commentLike').where({
              openid:openid,
              commentId:item._id
            }).get().then(re=>{
              if(re.data.length!=0) {
                item.isLike = true
                this.setData({
                  commentList:res.data
                })
              }else {
                item.isLike = false
                this.setData({
                  commentList:res.data
                })
              }
            })
          }else {
            item.isLike=false
            this.setData({
              commentList:res.data
            })
          }
          if(res.data.length<10) {
            this.setData({
              isAllLoaded:true
            })
          }
        })
      })
    })
  },
  //跳往用户详情页面
  toUserInfo() {
    wx.navigateTo({
      url: '/pages/userDetail/userDetail',
    })
  },
  //点击图片，图片放大
  showBig(e) {
    let current = e.target.dataset.src;
    // console.log(this.data.ImgList)
    wx.previewImage({
      current,
      urls: this.data.BigList,
    })
  },
  //点击显示输入框
  showInput(e) {
    // console.log("111")
    // console.log(e.currentTarget.dataset.index)
    this.setData({
      commentIndex:e.currentTarget.dataset.index,
      id:e.currentTarget.dataset.id,
      num:e.currentTarget.dataset.num,
      showInput:true
    })
  },
  //输入框和键盘隐藏
  comtBlur(event) {
    let {value} = event.detail;
    // console.log(value)
    this.setData({
      showInput:false,
      inputValue:value
    })
  },
  //输入框获得焦点
  comtFocus(e) {
    // 输入框聚焦时触发，e.detail = { value, height }，height 为键盘高度
    let keyboard_h = e.detail.height;
    this.setData({
      inputTop:keyboard_h
    })
  },
  //输入时触发
  inputComment(e) {
    // console.log(e.detail.value)
    this.setData({
      inputValue:e.detail.value
    })
  },
  //点击发送时触发
  sendMessage(e) {
    let userinfo = wx.getStorageSync('userInfo')
    let index = this.data.commentIndex
    let value = this.data.inputValue
    let Now = new Date().getTime()
    console.log(userinfo)
    if(index == 1) {
      let id = this.data.id
      let num = this.data.num
      let followList = this.data.commentList[num].followComment
      let Msg = {
        authName:userinfo.nickName,
        followMsg:value
      }
      followList.push(Msg)
      console.log(followList)
      this.data.commentList[num].followComment = followList
      this.setData({
        commentList:this.data.commentList,
        inputValue:''
      })
      wx.cloud.callFunction({
        name:"update",
        data:{
          collectionName:"comment",
          where:{
            _id:id
          },
          content:{
            data:{
              followComment:followList
            }
          }
        }
      })
    }else if(index == 2) {
      let getDetail = {
        userName:userinfo.nickName,
        userImg:userinfo.avatarUrl,
        msg:value,
        like:0,
        commentTime:Now,
        followComment:[],
        recipeId:this.data.content._id
      }
      let that=this;
      wx.cloud.callFunction({
        name:'add',
        data:{
          collectionName:'comment',
          data:getDetail
        }
      }).then(res=>{
        let gettime = processTime.timeHandle(Now)
        // console.log(gettime)
        getDetail.commentTime=gettime
        that.data.commentList.unshift(getDetail)
        that.setData({
          commentList:that.data.commentList,
          inputValue:''
        })
        // console.log(this.data.commentList)
      })
    }
  },
  //点击收藏标志后
  house() {
    let {collects}=this.data.content;
    let id=this.data.content._id;
    let openid=wx.getStorageSync('openid')||'';
    let addData = {
      openid,
      recipeid:id
    };
    let changeCondition = {_id:id}
    let changeData = {'collects':collects}
    this.change(collects,'house', addData, 'recipe',changeData,changeCondition,'收藏').then(res=>{
      this.data.content.collects=res;
      //要重新渲染数据需要通过setData
      this.setData({
        isHouse:true,
        detail:this.data.content
      })
    })
  },
  //点击取消收藏后
  unHouse() {
    let {collects}=this.data.content;
    let id=this.data.content._id;
    let openid=wx.getStorageSync('openid')||'';
    let deleteCondition = {
      openid,
      recipeid:id
    };
    let changeCondition = {_id:id}
    let changeData = {'collects':collects}
    this.cancelChange(collects,'house', deleteCondition, 'recipe',changeData,changeCondition,'收藏').then(res=>{
      this.data.content.collects=collects;
      //要重新渲染数据需要通过setData
      this.setData({
        isHouse:false,
        detail:this.data.content
      })
    })
  },
  //点击点赞标志后
  like() {
    let {like}=this.data.content;
    let id=this.data.content._id;
    let openid=wx.getStorageSync('openid')||'';
    let addData = {
      openid,
      recipeid:id
    };
    let changeCondition = {_id:id};
    let changeData = {'like':like}
    this.change(like,'like', addData, 'recipe',changeData,changeCondition,'点赞').then(res=>{
      this.data.content.like=res;
      //要重新渲染数据需要通过setData
      // console.log(like)
      this.setData({
        isLike:true,
        detail:this.data.content
      })
    })
  },
  //点击取消收藏后
  unLike() {
    let openid=wx.getStorageSync('openid')||'';
    let {like}=this.data.content;
    let id=this.data.content._id;
    let deleteCondition = {
      openid,
      recipeid:id
    };
    let changeCondition = {_id:id};
    let changeData = {'like':like}
    this.cancelChange(like,'like', deleteCondition, 'recipe',changeData,changeCondition,'点赞').then(res=>{
      this.data.content.like=res;
      //要重新渲染数据需要通过setData
      this.setData({
        isLike:false,
        detail:this.data.content
      })
    })
  },
  //点击评论的点赞时
  commentLike(e) {
    // console.log(e.currentTarget.dataset.index)
    let {like}=this.data.commentList[e.currentTarget.dataset.index];
    let id=this.data.commentList[e.currentTarget.dataset.index]._id;
    let openid=wx.getStorageSync('openid')||'';
    let addData = {
      openid,
      commentId:id
    };
    let changeCondition = {_id:id};
    let changeData = {'like':like}
    if(this.data.commentList[e.currentTarget.dataset.index].isLike) {
      this.cancelChange(like,'commentLike', addData, 'comment',changeData,changeCondition,'点赞').then(res=>{
        // console.log(res)
        this.data.commentList[e.currentTarget.dataset.index].like=res;
        this.data.commentList[e.currentTarget.dataset.index].isLike = false;
        //要重新渲染数据需要通过setData
        this.setData({
          commentList:this.data.commentList
        })
      })
    }else {
      this.change(like,'commentLike', addData, 'comment',changeData,changeCondition,'点赞').then(res=>{
        // console.log(res)
        this.data.commentList[e.currentTarget.dataset.index].like=res;
        this.data.commentList[e.currentTarget.dataset.index].isLike = true;
        //要重新渲染数据需要通过setData
        this.setData({
          commentList:this.data.commentList
        })
      })
    }
  },
  //点击点赞或收藏
  change(count, addCollectionName, addData,updateCollectionName,changeData,changeCondition,changeWord) {
    return new Promise((resolve, reject)=>{
      let isLogin=wx.getStorageSync('isLogin')||false;
      if(isLogin) {
        wx.checkSession({
          success:res=>{
            wx.cloud.callFunction({
              name:"add",
              data:{
                collectionName:addCollectionName,
                data:addData
              }
            }).then(res=>{
              wx.showToast({
                title: `${changeWord}成功`,
              })
            })
            count++;
            for(let i in changeData) {
              changeData[i] = count
            }
            wx.cloud.callFunction({
              name:"update",
              data:{
                collectionName:updateCollectionName,
                where:changeCondition,
                content:{
                  data:changeData
                }
              }
            }).then(res=>{
              // console.log(count)
              // return count
              resolve(count)
            })
          },
          fail:err=>{
            wx.showToast({
              title:`未登录，${changeWord}无效`,
              icon:"none"
            })
          }
        })
      }else {
        wx.showToast({
          title:`未登录，${changeWord}无效`,
          icon:"none"
        })
      }
    })
  },
  //点击取消点赞或取消收藏
  cancelChange(count, deleteCollectionName, deleteCondition,updateCollectionName,changeData,changeCondition,changeWord) {
    return new Promise((resolve, reject)=>{
      wx.checkSession({
        success:res=>{
          wx.cloud.callFunction({
            name:"delete",
            data:{
              collectionName:deleteCollectionName,
              where:deleteCondition
            }
          }).then(res=>{
            wx.showToast({
              title: `取消${changeWord}`,
            })
          }).catch(err=>{
            wx.showToast({
              title: `取消${changeWord}失败`,
              icon:"none"
            })
          })
          count--;
          for(let i in changeData) {
            changeData[i] = count
          }
          wx.cloud.callFunction({
            name:"update",
            data:{
              collectionName:updateCollectionName,
              where:changeCondition,
              content:{
                data:changeData
              }
            }
          }).then(res=>{
            // return count
            resolve(count)
          })
        },
        fail:err=>{
          wx.showToast({
            title:`取消${changeWord}失败，可能长时间未访问`,
            icon:"none"
          })
        }
      })
    })
  },
  //上拉触底时触发
  onReachBottom: function () {
    if (this.data.isAllLoaded) return;  
    let page=this.data.page+1;
    let openid = wx.getStorageSync('openid')||''
    this.setData({ 
      loading: true,
      page
    });  
    let isAllLoaded=false;
    //让加载时间稍微延长一点点setTimeout
    setTimeout(()=>{
      db.collection("comment").where({recipeId:this.data.content._id}).skip(page*10).limit(10).orderBy('commentTime','desc').get().then(res=>{
        if(res.data.length==0) {
          isAllLoaded=true;
          this.setData({
            loading:false,
            isAllLoaded,
          })
        }else {
          let commentList=this.data.commentList;
          let isLogin=wx.getStorageSync('isLogin')||false;
          // console.log(res.data)
          res.data.forEach((item,index)=>{
            item.commentTime = processTime.timeHandle(item.commentTime)
            if(isLogin) {
              db.collection('commentLike').where({
                openid:openid,
                commentId:item._id
              }).get().then(res=>{
                if(res.data.length!=0) {
                  item.isLike = true
                  commentList.push(item)
                  this.setData({
                    commentList
                  })
                }else {
                  item.isLike = false
                  commentList.push(item)
                  this.setData({
                    commentList
                  })
                }
              })
            }else {
              item.isLike=false
              commentList.push(item)
              this.setData({
                commentList
              })
            }
            if(index+1==res.data.length) {
              this.setData({
                isAllLoaded,
                loading:false,
              })
            }
          })
        }
      })
    },200)
  },
  //点击分享
  onShareAppMessage: function () {
    let dish=this.data.content;
    return {
      title: '快来一起学做菜吧',   //我们分享出去页面的标题
      path: `/pages/detail/detail?id=${dish._id}&name=${dish.dishName}`,  //我们分享页面的路径
    }
  },

})