//topic.js
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/request.js');
var wxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        topicData: null,
        postsList: null,
        page: 1,
        cate_id: 1,
        cate_img: null,
        showPostDisplay: false,
        floatDisplay: false,
        showerror: "none",
    },
    onLoad: function (request) {
        var id = request.id;
        this.setData({
            cate_id: id
        });
        this.fetchCategoriesData(id);
    },
    //获取分类列表
    fetchCategoriesData: function (id) {
        var self = this;
        self.setData({
            topicData: []
        });

        var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));

        getCategoryRequest.then(response => {
            var cate_img = "";
            if (typeof (response.data.cate_img) == "undefined" || response.data.cate_img == "") {
                cate_img = "../../images/website.png";
            }
            else {
                cate_img = response.data.cate_img;
            }

            self.setData({
                topicData: response.data,
                cate_img: cate_img
            });

            wx.setNavigationBarTitle({
                title: response.data.name,
                success: function (res) {
                    // success
                }
            });

            self.fetchPostsData(self.data);

        })
    },
    //获取文章列表数据
    fetchPostsData: function (data = {}) {
        var self = this;
        if (!data.page) data.page = 1;
        if (!data.cate_id) data.cate_id = 1;
        if (data.page === 1) {
            self.setData({
                postsList: []
            });
        }

        console.log('current page:' + data.page);

        var getPostsRequest = wxRequest.getRequest(Api.getPostsByCategories(data));
        getPostsRequest.then(function (response) {
            if (response.statusCode === 200) {

                var postsList = response.data.map(function (item) {
                    // 处理文章简略的html
                    var excerpt = item.excerpt.rendered;
                    if (excerpt) {
                        wxParse.wxParse('excerpt', 'html', excerpt, self, 5);
                        var str = self.data.excerpt.nodes[0].nodes[0].text;
                        item.excerpt.rendered = str.slice(0, -4);
                    }
                    return item;
                });

                // console.log(postsList);

                self.setData({
                    isCategoryPage: false,
                    floatDisplay: true,
                    showPostDisplay: true,
                    postsList: self.data.postsList.concat(postsList)
                });
                // console.log(self.data.showPostDisplay);

            } else {
                self.setData({
                    isLastPage: true
                });
            }
        }).catch(function () {
            if (data.page == 1) {
                self.setData({
                    showerror: "block",
                    floatDisplay: "none"
                });
            } else {
                wx.showModal({
                    title: '加载失败',
                    content: '加载数据失败,请重试.',
                    showCancel: false,
                });

                self.setData({
                    page: data.page - 1
                });
            }
        }).finally(function () {
            console.log('请求完毕');
        });
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
    //重新加载
    reload: function (e) {
        var self = this;
        if (self.data.categories && self.data.categories != 0) {

            self.setData({
                // categories: options.categoryID,
                isCategoryPage: true,
                showPostDisplay: false,
                showerror: false,

            });
            self.fetchCategoriesData(self.data.categories);
        }

        self.fetchPostsData(self.data);
    },
    //上拉加载分页
    onReachBottom: function () {
        var self = this;
        if (!self.data.isLastPage) {
            self.setData({
                page: self.data.page + 1
            });
            console.log('当前页' + self.data.page);
            this.fetchPostsData(self.data);
        }
        else {
            wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1000
            });
        }
    },
})
