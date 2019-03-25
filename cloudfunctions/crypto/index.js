// 云函数入口文件
const cloud = require('wx-server-sdk')
const notp = require('notp')
const crypto = require('crypto')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var token = notp.totp.gen(event.userKey)
  console.log(token)
  return {
    token,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}