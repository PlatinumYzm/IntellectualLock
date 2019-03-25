// pages/index/password.js
var app = getApp()
var wxbarcode = require('../../utils/index.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    nickName: '',
    token: '',
    openid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                nickName: res.userInfo.nickName
              })
            }
          })
        } else {
          wx.checkSession({
            success: function(res) {
              console.log('session_key未过期')
            },
            fail: function(res) {
              wx.login({
                success: function(res) {
                  console.log('重新登录')
                },
                fail: function(res) {},
                complete: function(res) {},
              })
            },
            complete: function(res) {},
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function() {

  },

  /**
   * 更换密钥
   */
  doChange: function() {
    let chars = ['0', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    function createRan(n) {
      let res = "";
      for (let i = 0; i < n; i++) {
        let index = Math.ceil(Math.random() * 35);
        res += chars[index];
      }
      return res;
    }
    var newKey = createRan(16);
    wx.setStorage({
      key: 'Key',
      data: newKey,
      success: function(res) {
        wxbarcode.qrcode('passwordcode', newKey, 550, 550)
        console.log("New Key: ",newKey);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})