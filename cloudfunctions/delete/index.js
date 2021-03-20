// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//连接数据库
const db=cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let {where,collectionName}=event;
  return new Promise((resolve,reject)=>{
    db.collection(collectionName).where(where).remove().then(res=>{
      resolve(res);
    }).catch(err=>{
      reject(err);
    })
  })
}