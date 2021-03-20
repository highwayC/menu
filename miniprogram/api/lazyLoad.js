const showImg=(component,group,height,select,that)=>{
  return new Promise((resolve,reject)=>{
    let list=that.selectComponent(component);
    wx.createSelectorQuery().in(list).selectAll(select).boundingClientRect((ret) => {
      ret.forEach((item, index) => {
        if (item.top <= height) {  //判断是否在显示范围内
          group[index].show = true // 根据下标改变状态
        }
      })
      resolve(group)
    }).exec()
  })
}

module.exports={
  showImg
}