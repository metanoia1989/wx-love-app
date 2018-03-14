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
        shownodata: false,
        isCollection: false,
        isReading: false,
        isComments: false,
        readLogs: []
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
                isComments: false,
            })
        }

        if(request.type === 'reading'){
            wx.setNavigationBarTitle({
                title: "最近浏览"
            });
            self.setData({
                isCollection: false,
                isReading: true,
                isComments: true,
            })
        }

        if(request.type === 'comments'){
            wx.setNavigationBarTitle({
                title: "我的评论"
            });
            self.setData({
                isCollection: false,
                isReading: false,
                isComments: true,
            })
        }

        this.fetchPostsData(request.type);
    },
    reload: function (e) {
        var self = this;
        this.setData({
            readLogs: []
        });
        self.setData({            
            showallDisplay: false, 
            showerror:  false,

        });
        // self.fetchPostsData();
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
    //获取文章
    fetchPostsData: function (type) {
        self = this;
        self.setData({
            showerror: false,
            shownodata: false 
        });
        var count = 0;
        if (type == 'reading') {
            self.setData({
                readLogs: (wx.getStorageSync('readLogs') || []).map(function (log) {
                    count++;
                    return log;
                })
            });

            self.setData({
                userInfo: app.globalData.userInfo,
                showallDisplay: true
            });

            if (count == 0) {
                self.setData({
                    shownodata: true
                });
            }

            console.log(self.data.readLogs)


        } else if (type == 'comment') {
            self.setData({
                readLogs: []
            });
            if (app.globalData.isGetOpenid) {
                var openid = app.globalData.openid;
                var getMyCommentsPosts = wxRequest.getRequest(Api.getWeixinComment(openid));
                getMyCommentsPosts.then(response => {
                    if (response.statusCode == 200) {
                        self.setData({
                            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
                                count++;
                                item[0] = item.post_id;
                                item[1] = item.post_title;
                                return item;
                            }))
                        });
                        self.setData({
                            userInfo: app.globalData.userInfo
                        });

                        if (count == 0) {
                            self.setData({
                                shownodata: true 
                            });
                        }
                    }
                    else {
                        console.log(response);
                        self.setData({
                            showerror: true,

                        });

                    }
                })

            }
            else {
                // self.userAuthorization();
            }

        } else if (type == 'collection') {
            self.setData({
                readLogs: (wx.getStorageSync('collectionLogs') || []).map(function (log) {
                    count++;
                    return log;
                })
            });

            self.setData({
                userInfo: app.globalData.userInfo,
                showallDisplay: true
            });

            if (count == 0) {
                self.setData({
                    shownodata: true
                });
            }

        }
    },
})
