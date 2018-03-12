/**
 * 构造请求url
 */

import config from 'config.js'

var domain = config.getDomain;
var pageCount = config.getPageCount;
var categoriesID = config.getCategoriesID;
var HOST_URI = 'https://' + domain + '/wp-json/wp/v2/';

module.exports = {
    // 获取文章列表的 url
    getPosts: function (obj) {
        var url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + obj.page;

        // if (obj.categories != 0) {
        //   url += '&categories=' + obj.categories;
        // }
        // else if (obj.search != '') {
        //   url += '&search=' + encodeURIComponent(obj.search);
        // }     
        return url;

    },
    // 获取分类文章列表数据
    getPostsByCategories: function (obj) {
        var url = HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=' + obj.page + '&categories=' + obj.cate_id;
        return url;
    },
    // 获取置顶的文章
    getStickyPosts: function () {
        var url = HOST_URI + 'posts?sticky=true&per_page=5&page=1';
        return url;
    },
    // 获取tag相关的文章列表
    getPostsByTags: function (id, tags) {
        var url = HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;
        return url;
    },
    // 获取多个id的文章列表
    getPostsByIDs: function (obj) {
        var url = HOST_URI + 'posts?include=' + obj;
        return url;
    },
    // 获取特定slug的文章内容
    getPostBySlug: function (obj) {
        var url = HOST_URI + 'posts?slug=' + obj;
        return url;
    },
    // 获取指定id的文章
    getPostByID: function (id) {
        return HOST_URI + 'posts/' + id;
    },
    // 获取页面列表数据
    getPages: function () {
        return HOST_URI + 'pages';
    },
    // 获取页面列表数据
    getPageByID: function (id, obj) {
        return HOST_URI + 'pages/' + id;
    },
    //获取分类列表
    getCategories: function (categoriesID = 'all') {
        var url = '';
        if (categoriesID == 'all') {
            url = HOST_URI + 'categories?per_page=100&orderby=count&order=desc';
        }
        else {
            url = HOST_URI + 'categories?include=' + categoriesID + '&orderby=count&order=desc';
        }
        return url
    },
    //获取顶级分类
    getTopCategories: function (id) {
        return HOST_URI + 'categories?per_page=100&parent=0';
    },
    //获取某个分类信息
    getCategoryByID: function (id) {
        var dd = HOST_URI + 'categories/' + id;
        return HOST_URI + 'categories/' + id;
    },
    //获取某文章评论
    getComments: function (obj) {
        var url = HOST_URI + 'comments?per_page=100&orderby=date&order=asc&post=' + obj.postID + '&page=' + obj.page;
        return url;
    },
    //获取网站的最新20条评论
    getNewComments: function () {
        return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
    },
    //获取回复
    getChildrenComments: function (obj) {
        var url = HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postID
        return url;
    },
    //获取最近的30个评论
    getRecentfiftyComments: function () {
        return HOST_URI + 'comments?per_page=30&orderby=date&order=desc'
    },
    //提交评论
    postComment: function () {
        return HOST_URI + 'comments'
    },
    //获取文章的第一个图片地址,如果没有给出默认图片
    getContentFirstImage: function (content) {
        var regex = /<img.*?src=[\'"](.*?)[\'"].*?>/i;
        var arrReg = regex.exec(content);
        var src = "../../images/logo700.png";
        if (arrReg) {
            src = arrReg[1];
        }
        return src;
    },
    //获取用户openid
    getOpenidUrl(id) {
        var url = HOST_URI_WATCH_LIFE_JSON;
        url += "weixin/getopenid";
        return url;
    },
};