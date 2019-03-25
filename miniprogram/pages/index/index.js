//index.js
var app = getApp()
var wxbarcode = require('../../utils/index.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    nickName: '',
    logged: false,
    takeSession: false,
    requestResult: '',
    token: '',
    openid: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

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

  onShow: function() {
    //var userKey
    wx.getStorage({
      key: 'Key',
      success: function(res) {
        app.globalData.userKey = res.data

        wx.cloud.callFunction({
          name: 'crypto',
          data: {
            userKey: app.globalData.userKey
          },
          success: res => {
            console.log('[云函数] [crypto] Unlock Key: ', res.result.token)
            app.globalData.token = res.result.token
            wxbarcode.qrcode('qrcode', res.result.token, 550, 550)
            console.log('app.globalData.token: ', res.result.token)
          },
          fail: err => {
            console.error('[云函数] [crypto] 调用失败', err)
            wx.navigateTo({
              url: '../deployFunctions/deployFunctions',
            })
          }
        })

      },
      fail: function() {
        console.log('暂无缓存')
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            app.globalData.openid = res.result.openid
            /**查询该openId的Key */
            const db = wx.cloud.database()
            db.collection('User').where({
              OpenId: app.globalData.openid
            }).get({
              success(res) {
                console.log(res.data)
                app.globalData.userKey = res.data[0].Key
                console.log('userKey: ', app.globalData.userKey)
                wx.setStorage({
                  key: 'Key',
                  data: app.globalData.userKey,
                  success() {
                    wx.cloud.callFunction({
                      name: 'crypto',
                      data: {
                        userKey: app.globalData.userKey
                      },
                      success: res => {
                        app.globalData.token = res.result.token
                        console.log('[云函数] [crypto] Unlock Key: ', res.result.token)
                        /**生成二维码 */
                        wxbarcode.qrcode('qrcode', res.result.token, 550, 550)
                      },
                      fail: err => {
                        console.error('[云函数] [crypto] 调用失败', err)
                        wx.navigateTo({
                          url: '../deployFunctions/deployFunctions',
                        })
                      }
                    })
                  }
                })
              },
              fail() {
                wx.showModal({
                  title: '注册',
                  content: '首次使用，请点击确认进行注册',
                  showCancel: true,
                  cancelText: '取消',
                  cancelColor: 'black',
                  confirmText: '确认',
                  confirmColor: 'green',
                  success: function(res) {
                    wx.navigateTo({
                      url: '',
                      success: function(res) {},
                      fail: function(res) {},
                      complete: function(res) {},
                    })
                  },
                  fail: function(res) {},
                  complete: function(res) {},
                })
              }
            })
            /*wx.navigateTo({
              url: '../userConsole/userConsole',
            })*/
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            wx.navigateTo({
              url: '../deployFunctions/deployFunctions',
            })
          }
        })
      },
      complete: function(res) {},
    })

  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  //刷新二维码 
  doUpdate: function() {
    wx.cloud.callFunction({
      name: 'crypto',
      data: {
        userKey: app.globalData.userKey
      },
      success: res => {
        app.globalData.token = res.result.token
        console.log('[云函数] [crypto] Unlock Key: ', res.result.token)
        /**生成二维码 */
        wxbarcode.qrcode('qrcode', res.result.token, 550, 550)
      },
      fail: err => {
        console.error('[云函数] [crypto] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  // 上传图片
  /**doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },*/


})