// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 函数参数
// from: 需要联查的一个表
// localField: 现在collection表中的一个字段
// foreignField: from的那个表里的一个字段，
//字段里的内容如果和localField字段内容相同就会获取到from表中的所有内容，并且放在你指定的as字段中
// as: 获取到数据后会生成一个新的字段，放在你联查后的数据中，
//如果这个字段你填写的是你collection表中已由的字段，就会将它原本的数据覆盖掉。
//match: 如同你正常查询时的where方法，
//因为使用聚合函数时你是不能使用where或者doc的，所以你可以在match中输入collection表的筛选条件
//aggregate()是聚合函数的意思，通常和match搭配使用
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection(event.collection).aggregate().lookup({
      from:event.from,
      localField: event.localField,
      foreignField: event.foreignField,
      as: event.as
    }). match(event.match).skip(event.skip).limit(10).end()
  } catch (e) {
    console.error(e)
  }
}