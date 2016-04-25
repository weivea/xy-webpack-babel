/**
 * Created by weijianli on 16/4/12.
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


  clean('_devTmp/webpackOutQa/', {read: false},function(){
    clean('_devTmp/htmlQa/', {read: false},function(){
      clean('_devTmp/staticQa/', {read: false},function(){
        clean('_devTmp/allStaticsQa/', {read: false},function(){
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
        webpackConfig.devtool = 'source-map';
        webpackConfig.entry = entrys;
        webpackConfig.output = {
          path:'_devTmp/webpackOutQa/',
          filename: '[name].js',
          publicPath: config.cdn_domaen_test+path.join('webFront',pkg.packageClassName,pkg.version)+'/'
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
      staticPath: '_devTmp/staticQa',
      urlBasePath: config.cdn_domaen_test+path.join('webFront',pkg.packageClassName,pkg.version)+'/',
      aliasPath: {'jsEntries':'_devTmp/webpackOutQa'},
      rootPathIMG:'img',
      rootPathCSS:'cssStyle',
      rootPathJS:'jsEntries',
      md5:false
    };
    gulp.src('html/**/*.html', { buffer: false })
      .pipe(htmlHelper(htmlHelperCfg))
      .pipe(gulp.dest('_devTmp/htmlQa'))
      .on('end',function () {
        copyFiles();
      });
  }
  function copyFiles(){
    console.log("copy static ....");
    gulp.src(['_devTmp/webpackOutQa/**','_devTmp/staticQa/**','!_devTmp/webpackOutQa/**/*.js'])
      .pipe(gulp.dest(path.join('_devTmp/allStaticsQa/webFront',pkg.packageClassName,pkg.version)))
      .on('end',function () {
        rsyncToCND();
      });

    console.log("copy html ....");
    gulp.src('_devTmp/htmlQa/**/*.html')
      .pipe(gulp.dest('../serverSide/views'));

  }


  


  function rsyncToCND(){
    //用来跑shell子进程
    var child_process = require('child_process'),
      child;

    var Dir = path.join(process.cwd(),'_devTmp/allStaticsQa/webFront',pkg.packageClassName);
    //var exclude = '**/for_server/**';
    var id_rsa = '/Users/buildWork/.ssh/id_rsa_all';
    var command = 'rsync -avC -e "ssh -p 36000 -i '+id_rsa+'" '+Dir+' user_00@119.29.112.230:/home/user_00/wwwroot/cdn.xiaoying.com/webFront/';
    console.log(command);
    child = child_process.exec(command,
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if(stderr){
          console.log('stderr: ' + stderr);
        }
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      }
    );
  }

}

if(module.parent){
  module.exports = dev;
}else{
  dev();
}