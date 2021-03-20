// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let {base64Data} =event;
  //fileContent只支持Buffer格式或文件流
  return await cloud.uploadFile({
    cloudPath:"images/"+Date.now()+".jpg",
    fileContent:Buffer.from(base64Data,"base64")
  })
}