// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const {collectionName,where} = event;
  return await db.collection(collectionName).where(where).get();
}