/**
 * Created by weijianli on 16/4/22.
 */
var serve = require('koa-static');
var koa = require('koa');
var app = koa();
var route = require('koa-router')();
var parse = require('co-body');
var views = require('co-views');
var co = require("co");
var artTemplate = require('./modules/artTemplate/art-template.js');
var render,render2;

render = artTemplate({
  base:'views',
  openTag:'{{',
  closeTag:'}}',
  cache:false
});
render2 = artTemplate({
  base:'views',
  openTag:'${',
  closeTag:'}',
  cache:false
});


//静态资源
app.use(serve('public'));

route.get('/index', function *(){
  this.body = yield render('index',{value:"你是我的小苹果"});
});
route.get('/index2', function *(){
  this.body = yield render2('index2',{value:"you are my apple"});
});


app.use(route.routes())
  .use(route.allowedMethods());

if(module.parent){
  module.exports = function(){
    app.listen('4500');
    console.log('listening on port :4500');
  }
}else{
  app.listen('4500');
  console.log('listening on port :4500');
}
