/**
 * Created by weijianli on 15/11/2.
 */

var qiniu = require('qiniu');
var request = require('superagent');
var config = {
  'ACCESS_KEY': 'g9GphEdJKkAh7OcgeEWmCA2GamhkfPPVr64QTW_u',
  'SECRET_KEY': 'iUnqzzqz9Ro3tnyQyb12cwBA2NsEGZglpdSzl5wH',
  'Bucket_Name': 'static',
  'Domain': 'https://dn-xiaoying-static.qbox.me/'

};
var uptoken,token,client;

function init(){
  qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = config.SECRET_KEY;

  uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);

  token = uptoken.token();

  client = new qiniu.rs.Client();
  console.log('qiniu init done.');
}


/**
 * 上传文件到七牛
 * localFile：本地文件名（含路径）
 * key：目的文件名（含路径）
 * cd:回调函数
 * */
function uploadFile(localFile, key,cb) {
  var extra = new qiniu.io.PutExtra();
  //extra.params = params;
  //extra.mimeType = mimeType;
  //extra.crc32 = crc32;
  //extra.checkCrc = checkCrc;

  qiniu.io.putFile(token, key, localFile, extra, function(err, ret) {
    cb(err,ret);
  });
}

/**
 * 删除文件
 * key：目的文件名（含路径）
 * cd:回调函数
 * */
function removeFile(key,cb){
  client.remove(config.Bucket_Name, key, cb)
}


/**
 * 刷新缓存
 * */
function refresh(url_list) {
  var ask_data = {
    "urls":url_list,
    "dirs":[]
  }
  var url = 'http://fusion.qiniuapi.com/refresh';
  var AccessToken = qiniu.util.generateAccessToken(url);
  console.log('AccessToken:'+AccessToken);
  request.post(url)
    .send(ask_data)
    .set('Content-Type','application/json')
    .set('Authorization',AccessToken)
    .end(function(err,res){
      console.log('');
      console.log('refreshed stay version url list:');
      console.log(url_list);
      console.log("invalidUrls:");
      console.log(res.res.body.invalidUrls);
    })
}



module.exports={
  init:function(cfg){
    config = {
      'ACCESS_KEY': config.ACCESS_KEY,
      'SECRET_KEY': config.SECRET_KEY,
      'Bucket_Name': (cfg.Bucket_Name)?cfg.Bucket_Name:config.Bucket_Name,
      'Domain': (cfg.Domain)?cfg.Domain:config.Domain
    };
    init();
  },
  /*
   * 上传文件到七牛
   * localFile：本地文件名（含路径）
   * key：目的文件名（含路径）
   * cd:回调函数
   * */
  uploadFile:uploadFile,


  /*
   * 删除文件
   * key：目的文件名（含路径）
   * cd:回调函数
   * */
  removeFile:removeFile,
  refresh:refresh
};