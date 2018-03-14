var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js');
var app = getApp();

Page({
    data: {
        showerror: "none",
        shownodata: "none",
        userInfo: null,
    },
    //复制链接
    copyLink: function (event) {
        var url = event.target.dataset.url;
        // this.ShowHideMenu();
        wx.setClipboardData({
            data: url,
            success: function (res) {
                wx.getClipboardData({
                    success: function (res) {
                        wx.showToast({
                            title: '链接已复制',
                            image: '../../images/link.png',
                            duration: 2000
                        });
                    }
                });
            }
        });
    },
})

