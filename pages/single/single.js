//single.js
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var util = require('../../utils/util.js');
var wxParse = require('../../wxParse/wxParse.js');
var wxApi= require('../../utils/wxApi.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        post: null,
        commentsList: [],
        isCollection: false,
        display: true,
        page: 1,
        postID: null,
        isLastPage: false,
        isNoComment: false,
        toView: '',
        isShow: false,
        placeholder: "输入评论",
        content: '',
        focus: false,
        parentID: 0,
        userid: null,
        toFromId: null,
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
                views: response.data.views,
                id: response.data.id
            };

            // 调用API从本地缓存中获取阅读记录并记录
            var logs = wx.getStorageSync('readLogs') || [];
            // 过滤重复值
            if (logs.length > 0) {
                logs = logs.filter(function (log) {
                    return log[0] !== id;
                });
            }
            // 如果超过指定数量
            if (logs.length > 19) {
                logs.pop();//去除最后一个
            }
            logs.unshift([id, response.data.title.rendered]);
            wx.setStorageSync('readLogs', logs);
            //end 

            wx.setNavigationBarTitle({
                title: post.title
            })

            self.setData({
                post: post,
                postID: post.id
            });
        }).then(response => {
            //判断是否收藏
            self.ifCollection(self.data.post.id);
        }).then(response => {
            //获取文章评论
            self.fetchCommentData(self.data, '0');
        })
    },
    //返回上一页
    back: function () {
        console.log('返回吗？')
        wx.navigateBack({
            delta: 1,
        });
    },
    //判断是否有收藏文章
    ifCollection: function (id) {
        //判断用户是否收藏
        var self = this;
        var logs = wx.getStorageSync('collectionLogs') || [];
        if (logs.indexOf(id) === -1) {
            self.setData({
                isCollection: false
            });
        } else {
            self.setData({
                isCollection: true
            });
        }
    },
    // 收藏文章
    toggleCollection: function (e) {
        var self = this;
        // 调用API从本地缓存中获取收藏记录并记录
        var isCollection = self.data.isCollection;
        console.log(isCollection);
        var id = e.target.id;
        var logs = wx.getStorageSync('collectionLogs') || [];
        // 过滤重复值
        if (isCollection) {
            //取消收藏
            logs = logs.filter(function (log) {
                return log[0] !== id;
            });
            wx.setStorageSync('collectionLogs', logs);

            this.setData({
                isCollection: false
            });
        } else {
            //添加收藏
            if (logs.length > 0) {
                logs = logs.filter(function (log) {
                    return log[0] !== id;
                });
            }
            // 如果超过指定数量
            if (logs.length > 19) {
                logs.pop();//去除最后一个
            }
            logs.unshift([id, self.data.post.title]);
            wx.setStorageSync('collectionLogs', logs);
            this.setData({
                isCollection: true
            });
        }
        //end 
        // console.log(e)
        // console.log(id)
        // console.log(logs)
    },
    reauth: function (e) {
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
    //判断用户是否授权
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
                console.log(url);
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
    //获取评论
    fetchCommentData: function (data, flag) {
        var self = this;
        if (!data) data = {};
        if (!data.page) data.page = 1;

        if(data.page == 1){
            self.setData({
                commentsList: [],
            });
        }
        var getCommentsRequest = wxRequest.getRequest(Api.getComments(data));
        console.log(Api.getComments(data))
        getCommentsRequest.then(response => {
            if (response.statusCode == 200) {
                if (response.data.length < 5) {
                    self.setData({
                        isLastPage: true,
                        isNoComment: true,
                    });
                }
                var commentsList = response.data.map(function (item) {
                    var strSummary = util.removeHTML(item.content.rendered);
                    var dateStr = item.date;
                    dateStr = dateStr.replace("T", " ");
                    var strdate = util.getDateDiff(dateStr);
                    item.date = strdate;
                    item.dateStr = dateStr;
                    item.summary = strSummary;
                    if (item.author_url.indexOf('wx.qlogo.cn') != -1) {
                        if (item.author_url.indexOf('https') == -1) {
                            item.author_url = item.author_url.replace("http", "https");
                        }
                    }
                    else {
                        item.author_url = "../../images/avatar.jpg";
                    }
                    return item;
                });

                self.setData({
                    commentsList: self.data.commentsList.concat(commentsList),
                });

                //打印评论信息
                // console.log(self.data.commentsList)

            } else {
                self.setData({
                    isLastPage: true,
                    isNoComment: true,
                });
            }

        })
            .catch(response => {
                wx.showModal({
                    title: '加载失败',
                    content: '加载数据失败,请重试.',
                    showCancel: false,
                });

                self.setData({
                    page: data.page - 1
                });
                console.log(response.data.message);
            })


    },

    //获取回复
    fetchChildrenCommentData: function (data, flag) {
        var self = this;
        var getChildrenCommentsRequest = wxRequest.getRequest(Api.getChildrenComments(data));
        getChildrenCommentsRequest
            .then(response => {
                if (response.data) {
                    self.setData({
                        ChildrenCommentsList: self.data.ChildrenCommentsList.concat(response.data.map(function (item) {
                            var strSummary = util.removeHTML(item.content.rendered);
                            var strdate = item.date
                            item.summary = strSummary;

                            item.date = util.formatDateTime(strdate);
                            if (item.author_url.indexOf('wx.qlogo.cn') != -1) {
                                if (item.author_url.indexOf('https') == -1) {
                                    item.author_url = item.author_url.replace("http", "https");
                                }
                            }
                            else {
                                item.author_url = "../../images/avatar.jpg";
                            }
                            return item;
                        }))

                    });
                }
                setTimeout(function () {
                    //wx.hideLoading();
                    if (flag == '1') {
                        wx.showToast({
                            title: '评论发布成功。',
                            icon: 'success',
                            duration: 900,
                            success: function () {

                            }
                        })
                    }
                }, 900);
            })
    },
    //加载更多评论
    loadMore: function () {
        var self = this;
        if (!self.data.isLastPage) {
            self.setData({
                page: self.data.page + 1
            });
            console.log('当前页' + self.data.page);
            this.fetchCommentData(self.data, '0');
        }
        else {
            wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1000
            });
        }
    },
    //跳转到评论区
    jumpTo: function(e){
        var target = e.currentTarget.dataset.opt;
        // console.log(target)
        this.setData({
            toView: target,
        });
    },
    //展示回复表单,隐藏功能图标
    showInput: function(){
        this.setData({
            isShow: !this.data.isShow,
            menuBackgroup: !this.data.false
        })
    },
    //点击非评论区隐藏功能菜单
    hiddenInput: function () {
        this.setData({
            isShow: false,
            menuBackgroup: false
        })
    },    
    //回复操作
    replay: function (e) {
        var self = this;
        var id = e.target.dataset.id;
        var name = e.target.dataset.name;
        var userid = e.target.dataset.userid;
        var toFromId = e.target.dataset.formid;
        var commentdate = e.target.dataset.commentdate;
        isFocusing = true;
        self.setData({
            parentID: id,
            placeholder: "回复" + name + ":",
            focus: true,
            userid: userid,
            toFromId: toFromId,
            commentdate: commentdate
        });
        console.log('toFromId', toFromId);
        console.log('replay', isFocusing);
    },
    onReplyBlur: function (e) {
        var self = this;
        var isFocusing = self.data.focus;
        console.log('onReplyBlur', isFocusing);
        if (!isFocusing) {
            {
                const text = e.detail.value.trim();
                if (text === '') {
                    self.setData({
                        parentID: "0",
                        placeholder: "输入评论",
                        userid: "",
                        toFromId: "",
                        commentdate: ""
                    });
                }

            }
        }
        console.log(isFocusing);
    },
    onRepleyFocus: function (e) {
        var self = this;
        var isFocusing = self.data.focus;
        console.log('onRepleyFocus', isFocusing);
        if (!self.data.focus) {
            self.setData({ focus: true })
        }


    },
    //提交评论
    formSubmit: function (e) {
        console.log(e)
        var self = this;
        var comment = e.detail.value.inputComment;
        var parent = self.data.parentID;
        var postID = e.detail.value.inputPostID;

        var formId = e.detail.formId;
        var userid = self.data.userid;
        var toFromId = self.data.toFromId;
        var commentdate = self.data.commentdate;
        if (comment.length === 0) {
            wx.showModal({
                title: "提示",
                content: "评论内容不能为空",
                showCancel: false
            });
        }
        else {
            if (app.globalData.isGetOpenid) {
                var name = app.globalData.userInfo.nickName;
                var author_url = app.globalData.userInfo.avatarUrl;
                var email = app.globalData.openid + "@qq.com";
                var openid = app.globalData.openid;
                var fromUser = app.globalData.userInfo.nickName;
                var data = {
                    post: postID,
                    author_name: name,
                    author_email: email,
                    content: comment,
                    author_url: author_url,
                    parent: parent,
                    openid: openid,
                    userid: userid,
                    formId: formId
                };
                var url = Api.postWeixinComment();
                var postCommentRequest = wxRequest.postRequest(url, data);
                console.log("提交用户评论")
                console.log(url)
                console.log(data)
                // console.log(postCommentRequest)
                postCommentRequest
                    .then(res => {
                        if (res.statusCode == 200) {
                            if (res.data.status == '200') {
                                self.setData({
                                    content: '',
                                    parent: "0",
                                    userid: 0,
                                    placeholder: "输入评论",
                                    focus: false,
                                    // commentsList: []

                                });

                                setTimeout(function () {
                                    //wx.hideLoading();
                                    //if (flag == '1') {
                                    wx.showToast({
                                        title: '评论发布成功。',
                                        icon: 'success',
                                        duration: 900,
                                        success: function () {
                                            self.hiddenInput()
                                        }
                                    })
                                    // }
                                }, 900);
                                console.log(res.data.message);
                                if (parent != "0" && !util.getDateOut(commentdate) && toFromId != "") {
                                    var useropenid = res.data.useropenid;
                                    var data =
                                        {
                                            openid: useropenid,
                                            postid: postID,
                                            template_id: self.data.replayTemplateId,
                                            form_id: toFromId,
                                            total_fee: comment,
                                            fromUser: fromUser,
                                            flag: 3,
                                            parent: parent
                                        };

                                    url = Api.sendMessagesUrl();
                                    var sendMessageRequest = wxRequest.postRequest(url, data);
                                    sendMessageRequest.then(response => {
                                        if (response.data.status == '200') {
                                            console.log(response.data.message);
                                            // wx.navigateBack({
                                            //     delta: 1
                                            // })

                                        }
                                        else {
                                            console.log(response.data.message);

                                        }

                                    });

                                }


                                // console.log(res.data.code);
                                self.fetchCommentData(self.data, '1');
                            }
                            else if (res.data.status == '500') {
                                self.setData({
                                    'dialog.hidden': false,
                                    'dialog.title': '提示',
                                    'dialog.content': '评论失败，请稍后重试。'

                                });
                            }


                        }
                        else {

                            if (res.data.code == 'rest_comment_login_required') {
                                self.setData({
                                    'dialog.hidden': false,
                                    'dialog.title': '提示',
                                    'dialog.content': '需要开启在WordPress rest api 的匿名评论功能！'

                                });
                            }
                            else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                                self.setData({
                                    'dialog.hidden': false,
                                    'dialog.title': '提示',
                                    'dialog.content': 'email填写错误！'

                                });
                            }
                            else {
                                console.log(res.data.code)
                                self.setData({
                                    'dialog.hidden': false,
                                    'dialog.title': '提示',
                                    'dialog.content': '评论失败,' + res.data.message

                                });
                            }
                        }
                    }).catch(response => {
                        console.log(response)
                        self.setData({
                            'dialog.hidden': false,
                            'dialog.title': '提示',
                            'dialog.content': '评论失败,' + response

                        });
                    })

            }
            else {
                console.log("用户还未授权")
                console.log(app.globalData)
                self.reauth();

            }

        }

    },
})
