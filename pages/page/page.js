//single.js
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        datasList: null,
        showerror: false,
        showallDisplay: false,
        isCollection: false,
        isReading: false
    },
    onLoad: function (request) {
        var self = this;
        if(request.type === 'collection'){
            wx.setNavigationBarTitle({
                title: "收藏文章"
            });
            self.setData({
                isCollection: true,
                isReading: false,
            })
        }

        if(request.type === 'reading'){
            wx.setNavigationBarTitle({
                title: "最近浏览"
            });
            self.setData({
                isCollection: false,
                isReading: true,
            })
        }
        // this.fetchDetailData(request.id);
    },
    reload: function (e) {
        var self = this;
        this.setData({
            readLogs: []
        });
        self.setData({            
            showallDisplay: "none",
            showerror: "none",

        });
        self.fetchCommentsData();
    },
    // 跳转至查看文章详情
    redictDetail: function (e) {
        // console.log('查看文章');
        var id = e.currentTarget.id,
            url = '../single/single?id=' + id;
        wx.navigateTo({
            url: url
        })
    },
})
