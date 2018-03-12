
var Api = require('../../utils/api.js');
var wxParse = require('../../wxParse/wxParse.js');
var wxRequest = require('../../utils/request.js')
var util = require('../../utils/util.js')

import config from '../../utils/config.js'
var pageCount = config.getPageCount;

Page({
    data: {
        title: '最新评论列表',
        showerror: "none",
        showallDisplay: "block",
        readLogs: []

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
    onLoad: function (options) {
        var self = this;
        self.fetchCommentsData();
    },
    //获取最新评论数据
    fetchCommentsData: function () {
        var self = this;
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        var getNewComments = wxRequest.getRequest(Api.getNewComments());
        getNewComments.then(response => {
            if (response.statusCode == 200) {
                this.setData({
                    readLogs: self.data.readLogs.concat(response.data.map(item => {
                        var i = {};
                        i.post_id = item.post_id;
                        i.date = item.date;
                        i.author = item.author_name;
                        i.author_img = item.author_avatar_urls[0];
                        i.content = util.removeHTML(item.content.rendered);
                        return i;
                    }))
                });
                self.setData({
                    showallDisplay: "block"
                });
                
            }
            else {
                console.log(response);
                this.setData({
                    showerror: 'block'
                });

            }
        }).catch(function () {
                self.setData({
                    showerror: "block",
                    floatDisplay: "none"
                });

            })
            .finally(function () {
                wx.hideLoading();
            })
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
    onPullDownRefresh: function () {
        var self = this;
        this.setData({
            readLogs: []
        });
        self.setData({
            showallDisplay: "none",
            showerror: "none",
        });
        self.fetchCommentsData();
        //消除下刷新出现空白矩形的问题。
        wx.stopPullDownRefresh();
    }
})



