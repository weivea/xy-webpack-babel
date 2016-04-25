/**
 * Created by weijianli on 16/4/22.
 */
var fs = require("fs");
var path = require("path");

var glob = require("glob");
var gulp = require("gulp");
var webpack = require("webpack");
var htmlHelper = require('gulp-html-helper');
var clean = require('rimraf');

var webpackConfig = require('./webpack.config.js');
var config = require('./package.config.js');
var pkg = require(process.cwd()+'/package.json');

function dev(){


  clean('_devTmp/webpackOutBuild/', {read: false},function(){
    clean('_devTmp/htmlBuild/', {read: false},function(){
      clean('_devTmp/staticBuild/', {read: false},function(){
        clean('_devTmp/allStaticsBuild/', {read: false},function(){
          console.log('clean over');
          var jsOper = new opJs();
          jsOper.setConfig(function () {
            jsOper.runWork();
          });
        });
      });
    });
  });

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

    console.log('config...');
    cfg();

    function cfg() {
      glob("./jsEntries/**", {nodir: true}, function (err, files) {
        var entrys = {};
        files.map(function (val) {
          if(/(\.js|\.jsx)$/i.test(val))
            entrys[val.replace(/(\.js|\.jsx)$/i, '').replace("./jsEntries/", '')] = val;
        });
        console.log(entrys);
        webpackConfig.entry = entrys;
        webpackConfig.output = {
          path:'_devTmp/webpackOutBuild/',
          filename: '[name].js',
          publicPath: config.cdn_domaen+path.join('webFront',pkg.packageClassName,pkg.version)+'/'
        };
        webpackConfig.plugins = [
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.optimize.UglifyJsPlugin(),
          new webpack.NoErrorsPlugin()
        ];
        this_.compiler = webpack(webpackConfig);
        if(cb){
          cb();
        }
      });
    }
  };
  opJs.prototype.runWork = function () {
    if(!this.compiler){return;}
    console.log('webpack working...');

    this.compiler.run(function(err, stats) {
      // ...
      if(stats.hasWarnings()){
        console.log('webpack warning!!');
        console.log(stats.toJson({errorDetails:true}).warnings);
      }
      if(!stats.hasErrors()){
        console.log('webpack done...');
        ophtml();
      }else {
        console.log('webpack wrong!!');
        var errors = stats.toJson({errorDetails:true}).errors;
        for(var i in errors){
          console.log(errors[i]);
        }

      }
    });

  };






  function ophtml(){
    console.log("op html ....");
    var htmlHelperCfg = {
      staticPath: '_devTmp/staticBuild',
      urlBasePath: config.cdn_domaen+path.join('webFront',pkg.packageClassName,pkg.version)+'/',
      aliasPath: {'jsEntries':'_devTmp/webpackOutBuild'},
      rootPathIMG:'img',
      rootPathCSS:'cssStyle',
      rootPathJS:'jsEntries',
      md5:false
    };
    gulp.src('html/**/*.html', { buffer: false })
      .pipe(htmlHelper(htmlHelperCfg))
      .pipe(gulp.dest('_devTmp/htmlBuild'))
      .on('end',function () {
        copyFiles();
      });
  }
  function copyFiles(){
    console.log("copy static ....");
    gulp.src(['_devTmp/webpackOutBuild/**','_devTmp/staticBuild/**','!_devTmp/webpackOutBuild/**/*.js'])
      .pipe(gulp.dest(path.join('_devTmp/allStaticsBuild/webFront',pkg.packageClassName,pkg.version)))
      .on('end',function () {
        //rsyncToCND();
      });

    console.log("copy html ....");
    gulp.src('_devTmp/htmlBuild/**/*.html')
      .pipe(gulp.dest('../serverSide/views'));

  }





  

}


if(module.parent){
  module.exports = dev;
}else{
  dev();
}