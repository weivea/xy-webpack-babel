/**
 * Created by weijianli on 16/4/12.
 */
var fs = require("fs");
var path = require("path");

var glob = require("glob");
var gulp = require("gulp");
var webpack = require("webpack");
var htmlHelper = require('gulp-html-helper');

var webpackConfig = require('./webpack.config.js');


var config = require('./package.config.js');
var pkg = require(process.cwd()+'/package.json');
function dev(){
  var opHtmlInRunWorkFlag = false;
  /**
   * 编译js
   * */
  function opJs(){
    // returns a Compiler instance
    this.compiler = null;
    this.watcher = null;
  }
  opJs.prototype.setConfig =function (cb) {
    var this_ = this;
    if(this.watcher){
      console.log('stop..');
      this.watcher.close(function () {
        this_.watcher = null;
        console.log('reConfig...');
        cfg();
      })
    }else {
      console.log('config...');
      cfg();
    }
    function cfg() {
      glob("./jsEntries/**", {nodir: true}, function (err, files) {
        var entrys = {};
        files.map(function (val) {
          if(/(\.js|\.jsx)$/i.test(val))
            entrys[val.replace(/(\.js|\.jsx)$/i, '').replace("./jsEntries/", '')] = val;
        });
        console.log(entrys);
        webpackConfig.devtool = 'source-map';
        webpackConfig.entry = entrys;
        webpackConfig.output = {
          path:'_devTmp/webpackOutDev/',
            filename: '[name].js',
            publicPath: '/devStatic/'
        };
        this_.compiler = webpack(webpackConfig);
        if(cb){
          cb();
        }
      });
    }
    
    
    
    
  };


  opJs.prototype.runWork = function () {
    if(!this.compiler){return;}
    console.log('watching...');

    this.watcher = this.compiler.watch({ // watch options:
      aggregateTimeout: 300, // wait so long for more changes
      poll: true // use polling instead of native watchers
      // pass a number to set the polling interval
    }, function(err, stats) {
      
      // ...
      if(stats.hasWarnings()){
        console.log('webpack warning!!');
        console.log(stats.toJson({errorDetails:true}).warnings);
      }
      if(!stats.hasErrors()){
        console.log('webpack working...');
        if(opHtmlInRunWorkFlag){
          copyFiles();
        }else {
          opHtmlInRunWorkFlag=true;
          ophtml();
        }
      }else {
        console.log('webpack wrong!!');
        var errors = stats.toJson({errorDetails:true}).errors;
        for(var i in errors){
          console.log(errors[i]);
        }
        
      }

    });
  };
  opJs.prototype.stopWork =function (cb) {
    if(!this.watcher){return;}
    console.log('stop...');
    var  this_ = this;
    this.watcher.close(function () {
      this_.watcher = null;
      if(cb){
        cb();
      }
    });
  }

  var jsOper = new opJs();
  jsOper.setConfig(function () {
    jsOper.runWork();
  });



  /**
   * 检测入口文件数量的变化
   * */
  glob("./jsEntries/**", {nodir: true}, function (err, files) {
    var entrys = {};
    files.map(function (val) {
      if (/(\.js|\.jsx)$/i.test(val)) {
        ///console.log(val);
        entrys[val.replace("./jsEntries/", '')] = true;
      }
    });
    fs.watch(path.join(process.cwd(), 'jsEntries'), {recursive: true}, function (event, filename) {
      if (/(\.js|\.jsx)$/i.test(filename)) {
        if(!entrys[filename]){
          entrys[filename] = true;
          console.log('new entry!!');
          jsOper.setConfig(function () {
            jsOper.runWork();
          });
        }
      }
    });
  });

  
  gulp.watch('html/**/*.html',function(){
    ophtml();
  });

  function ophtml(){
    console.log("op html ....");
    var htmlHelperCfg = {
      staticPath: '_devTmp/staticDev',
      urlBasePath: '/devStatic/',
      aliasPath: {'jsEntries':'_devTmp/webpackOutDev'},
      rootPathIMG:'img',
      rootPathCSS:'cssStyle',
      rootPathJS:'jsEntries',
      md5:false
    };
    gulp.src('html/**/*.html', { buffer: false })
      .pipe(htmlHelper(htmlHelperCfg))
      .pipe(gulp.dest('_devTmp/htmlDev'))
      .on('end',function () {
        copyFiles();
      });
  }
  
  
  function copyFiles(){
    console.log("copy static ....");
    gulp.src(['_devTmp/webpackOutDev/**','_devTmp/staticDev/**','!_devTmp/webpackOutDev/**/*.js'])
      .pipe(gulp.dest('../serverSide/public/devStatic'));

    console.log("copy html ....");
    gulp.src('_devTmp/htmlDev/**/*.html')
      .pipe(gulp.dest('../serverSide/views'));

  }
  
  
}


if(module.parent){
  module.exports = dev;
}else{
  dev();
}