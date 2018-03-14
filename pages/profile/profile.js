//index.js
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
var Api = require('../../utils/api.js')
var util = require('../../utils/util.js')


//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        readLogs: [],
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    // bindViewTap: function () {
    //     wx.navigateTo({
    //         url: '../logs/logs'
    //     })
    // },
    onLoad: function () {
        var self = this;
        if (!app.globalData.isGetOpenid) {
            self.getUsreInfo();
            console.log('获取用户授权中')
        }
        else {
            self.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
            });
        }

        console.log("是否有用户信息：" + self.data.hasUserInfo);
    },
    reload: function (e) {
        var self = this;
        if (!app.globalData.isGetOpenid) {
            self.getUsreInfo();
            console.log('获取用户授权中')
        }
        else {
            self.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
            });
        }        
    },    
    //获取用户授权信息
    userAuthorization: function () {
        var self = this;
        // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
        wx.getSetting({
            success: function success(res) {
                console.log(res.authSetting);
                var authSetting = res.authSetting;
                if (util.isEmptyObject(authSetting)) {
                    console.log('第一次授权');
                } else {
                    console.log('不是第一次授权', authSetting);
                    // 没有授权的提醒
                    if (authSetting['scope.userInfo'] === false) {
                        wx.showModal({
                            title: '用户未授权',
                            content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
                            showCancel: true,
                            cancelColor: '#296fd0',
                            confirmColor: '#296fd0',
                            confirmText: '设置权限',
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                    wx.openSetting({
                                        success: function success(res) {
                                            console.log('打开设置', res.authSetting);
                                            var scopeUserInfo = res.authSetting["scope.userInfo"];
                                            if (scopeUserInfo) {
                                                self.getUsreInfo();
                                            }
                                        }
                                    });
                                }
                            }
                        })
                    }
                }
            }
        });
    },
    //获取用户信息
    getUsreInfo: function () {
        var self = this;
        var wxLogin = wxApi.wxLogin();
        var jscode = '';
        wxLogin().then(response => {
            jscode = response.code
            var wxGetUserInfo = wxApi.wxGetUserInfo()
            return wxGetUserInfo()
        }).
            //获取用户信息
            then(response => {
                console.log(response.userInfo);
                console.log("成功获取用户信息(公开信息)");
                app.globalData.userInfo = response.userInfo;
                app.globalData.isGetUserInfo = true;
                self.setData({
                    userInfo: response.userInfo,
                    hasUserInfo: true
                });

                var url = Api.getOpenidUrl();
                var data = {
                    js_code: jscode,
                    encryptedData: response.encryptedData,
                    iv: response.iv,
                    avatarUrl: response.userInfo.avatarUrl
                }
                console.log('开始获取用户 openid');
                // console.log(data);
                // console.log(url);
                // console.log(wxRequest);
                wx.request({
                    url: url,
                    method: "POST",
                    data: data,
                    header: {
                        "content-type": "application/json"
                    },
                    success: response => {
                        if (response.data.status == '200') {
                            console.log(response.data.openid)
                            console.log("openid 获取成功");
                            app.globalData.openid = response.data.openid;
                            app.globalData.isGetOpenid = true;
                        } else {
                            console.log(response.data.message);
                            console.log('获取用户openid失败');
                        }
                    }
                });

            }).catch(function (error) {
                console.log('error: ' + error.errMsg);
                self.userAuthorization();
            })
    },
})
