const db=wx.cloud.database();
const loadData = (where,col1,col2,col1H,col2H)=>{
  return new Promise((resolve, reject)=>{
    db.collection('recipe').limit(10).where(where).orderBy('like','desc').get().then(res=>{
      let list=res.data;
      let loading=false;
      if(list.length<10) {
        loading=true;
      }
      list.forEach(item => {
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
      // console.log(Allheight)
      let result = {
        col1,
        col2,
        col1H,
        col2H,
        Allheight,
        loading
      }
      resolve(result)
    })
  })
}

const reachBottom = (where,col1,col2,col1H,col2H,page)=> {
  return new Promise((resolve, reject)=>{
    setTimeout(() => {
      db.collection('recipe').where(where).limit(10).orderBy('like','desc').skip(page*10).get().then(res=>{
        let isAllLoaded=false;
        let list=res.data;
        if(list.length <= 10) {
          isAllLoaded=true;
        }
        list.forEach(item => {
          item.show=false;
          let width=item.width;
          let height=item.height;
          let scale = 350 / width; 
          let imgHeight= height*scale;
          item.width=350;
          item.height=imgHeight;
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
        let result = {
          col1,
          col2,
          col1H,
          col2H,
          isAllLoaded,
          Allheight
        }
        resolve(result)
      })
    }, 500)
  })
}

module.exports={
  loadData,
  reachBottom
}