//topic.js
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        topicsList: null,
        cate_id: 1,
    },
    onLoad: function () {
        this.fetchTopicData();
        wx.setNavigationBarTitle({
            title: "专题"
        })
    },
    //获取分类数据
    fetchTopicData: function () {
        var self = this;
        var getRequestTopic = wxRequest.getRequest(Api.getTopCategories()); getRequestTopic.then(response => {
            self.setData({
                topicsList: response.data,
                isCategoryPage: true,
                showPostDisplay: false,
                floatDisplay: false,
            })
        });
    },
    // 路由到专题列表页
    redirectCate: function (event) {
        console.log('redictCate');
        var id = event.currentTarget.id; // 这里的id 其实是WordPress 中的文章id，需要传递到single 页面
        var url = '../list/list?id=' + id;
        wx.navigateTo({
            url: url
        })
    },
    // 路由导航到文章页
    redirectSingle: function (event) {
        console.log('redictSingle');
        var id = event.currentTarget.id; // 这里的id 其实是WordPress 中的文章id，需要传递到single 页面
        var url = '../single/single?id=' + id;
        wx.navigateTo({
            url: url
        })
    },
})
