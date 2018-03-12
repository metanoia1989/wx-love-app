//single.js
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        post: null,
    },
    onLoad: function (request) {
        this.fetchDetailData(request.id);
    },
    fetchDetailData: function (id) {
        var self = this;
        var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
        getPostDetailRequest.then(response => {
            wxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
            var post = {
                date: response.data.date,
                link: response.data.link,
                title: response.data.title.rendered,
                tags: response.data.title.tags,
                comment_count: response.data.comment_count,
                views: response.data.views
            };

            wx.setNavigationBarTitle({
                title: post.title
            })

            self.setData({
                post: post
            });
        })
    },
    //返回上一页
    back: function () {
        console.log('返回吗？')
        wx.navigateBack({
            delta: 1,
        });
    },
})
