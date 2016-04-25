/**
 * Created by weijianli on 16/4/12.
 */

"use strict";


var glob = require("glob");
var config = require(process.cwd()+'/_cfgBuild/package.config.js');
var qiniuFileOp = require('./qiniuFileOp.js');
var path = require("path");
var fs = require("fs");
var statics_map_json = require(process.cwd()+'/statics.map.json');
var pkg = require(process.cwd()+'/package.json');
var up_counter = 0;

function upload(){
  qiniuFileOp.init({
    Bucket_Name:pkg.cdn_Bucket_Name,
    Domain:pkg.cdn_domaen
  });

  var pattern = './_devTmp/allStaticsBuild/webFront/'+pkg.packageClassName+'/'+pkg.version+'/**';
  console.log(pattern)
  glob(pattern, {nodir: true}, function (err, files) {

    if(err){
      console.log(err);
    }
    else
    {
      console.log("uploading....");
      //console.log(files);
      for(var ind in files){
        var key_ = files[ind].replace('./_devTmp/allStaticsBuild/','');

        var local = files[ind];
        //console.log("key.... "+key_);
        uploadOne(local,key_, function () {
          up_counter++;
          if(up_counter == files.length){
            write_statics_map_json();
            up_counter=0;
          }
        });

      }
    }
  })
}

function uploadOne(local,key,cb){
  if(statics_map_json[key]){
    cb();
    return;
  }
  console.log("uploading.... "+local);
  qiniuFileOp.uploadFile(local,key,function(err,ret){
    if(!err){
      //console.log(ret);
      console.log("success:" + config.cdn_domaen + ret.key);
      statics_map_json[ret.key] = ret.hash;
      cb();
    }
    else{
      console.log("fail:"+key);
      console.log(err);
      qiniuFileOp.removeFile(key,function(err,ret){
        if(!err){
          qiniuFileOp.uploadFile(local,key,function(err,ret){
            if(!err){
              console.log("reSuccess:" + config.cdn_domaen + ret.key);
              statics_map_json[ret.key] = ret.hash;
              cb();
            }
            else{
              console.log(err);
              cb();
            }
          });
        }
      });
    }
  });
}

function write_statics_map_json(){
  fs.writeFile('statics.map.json', JSON.stringify(statics_map_json), function (err) {
    if (err) throw err;
    console.log('statics_map_json saved!');
  });
}

module.exports = upload;

if(module.parent){
  module.exports = upload;
}else{
  upload();
}