//index.js

var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

import config from '../../utils/config.js';

//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        postsList: [],
        page: 1,
        isLastPage: false,
        scrollHeight: 0,
        scrollTop: 0,
        inputShowed: false,
        inputVal: ""
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        var self = this;
        wx.getSystemInfo({
            success: function(response){
                self.setData({
                    scrollHeight: response.windowHeight
                });
            }
        });
        this.fetchPostsData();
    },

    //页面滚动，记录滚动条的位置
    scroll: function(event){
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },

    //获取文章列表数据
    fetchPostsData: function (data = {}) {
        var self = this;
        if(!data.page) data.page = 1;
        if (data.page === 1) {
            self.setData({
                postsList: []
            });
        }
        console.log('current page:' + data.page);

        var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
        getPostsRequest.then(function (response) {
            if(response.statusCode === 200){
                var postsList = response.data.map(function (item) {
                    // 处理文章简略的html
                    var excerpt = item.excerpt.rendered;
                    if(excerpt){
                        wxParse.wxParse('excerpt', 'html', excerpt, self, 5);
                        var str =  self.data.excerpt.nodes[0].nodes[0].text;
                        item.excerpt.rendered = str.slice(0, -4);
                    }
                    return item;
                });

                self.setData({
                    postsList: self.data.postsList.concat(postsList)
                });

            }else{
                self.setData({
                    isLastPage: true
                });
            }
        }).catch(function (response) {
            wx.showModal({
                title: '加载失败',
                content: '加载数据失败,请重试.',
                showCancel: false,
            });
        }).finally(function (response) {
            console.log('请求完毕');
        })
    },
    // 触底刷新
    downLoad: function () {
        var self = this;
        if(!self.data.isLastPage ){
            self.setData({page: self.data.page + 1})
            this.fetchPostsData({ page: self.data.page  });
        }else{
            wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1000
            })
        }
    },
    // 滑动到顶部刷新
    topLoad: function(event){
        var self = this;
        console.log('滑动到顶部')
        self.setData({
            page: 1,
            scrollTop: 0,
        });
        
        self.fetchPostsData({page: self.data.page});
    },
    // 路由导航到文章内页
    redirectSingle: function (event) {
        console.log('redictSingle');
        var id = event.currentTarget.id; // 这里的id 其实是WordPress 中的文章id，需要传递到single 页面
        var url = '../single/single?id=' + id;
        console.log(url)
        wx.navigateTo({
            url: url
        })
    },
    //搜索相关
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    }    
})

