const uploadImage=()=>{
  return new Promise((resolve,reject)=>{
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      success: function(res) {
        // console.log(res)
        let type;
        if (res.tapIndex == 0) {
          type='album';
        } else if (res.tapIndex == 1) {
          type='camera';
        }
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: [type],
          success:(res)=> {
            resolve(res.tempFilePaths);
          }
        }) 
      },
      fail: function(res) {
        // console.log(res.errMsg)
        if(res.errMsg!="showActionSheet:fail cancel") {
          reject(res)
        }
      }
    })
  })
}

  module.exports={
    uploadImage
}
  