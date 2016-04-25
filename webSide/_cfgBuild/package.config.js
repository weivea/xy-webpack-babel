/**
 * Created by weijianli on 16/4/21.
 */
module.exports = {


  "tpl_path_test":"/Users/weijianli/Work/tplServer_node/views",//用于测试环境：模板编译输出目录（yztfe test 编译输出到此目录）
  "tpl_path_server":"/Users/weijianli/Work/tplServer_node/views",//用于正式环境：模板编译输出目录（yztfe build 编译输出到此目录）

  "cdn_domaen_test": "https://cdn.xiaoying.com/",//测试环境，CDN静态资源站域名
  "cdn_domaen": "https://dn-xiaoying-static.qbox.me/",//正式环境，CDN静态资源站域名
  "cdn_bucket_name": "static"//七牛云的bucket_name，正式环境七牛云是cdn源站
};