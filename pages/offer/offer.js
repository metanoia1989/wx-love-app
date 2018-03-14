//single.js
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        article: null,
    },
    onLoad: function (request) {
        this.getPageData();
    },
    //获取简历页面信息
    getPageData: function () {
        var self = this;
        var getPageRequest = wxRequest.getRequest('https://blog.xinzedq.com/wp-json/wp/v2/pages/485');
        getPageRequest.then(response => {
            if (response.statusCode == 200) {
                var article = response.data.content.rendered;
                // console.log(article);
                wxParse.wxParse('article', 'html', article, self, 5);
            }
        }).catch(response => {
            wx.showModal({
                title: '加载失败',
                content: '加载数据失败,请重试.',
                showCancel: false,
            });
        })
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
