/* ------------------------------------- *!
  这个模板复制到项目中改名, 作为启动脚本
  复制 config/config.js 目录和文件到项目中
  mixer 会读取其中配置, 创建 logs 日志目录
  引入 logger-lib 作为日志输出组件
  引入 configuration-lib 作为配置组件
// ------------------------------------- */ 

var express = require('express');
var mixer   = require('../index.js'); // require('mixer-lib')


// 导出函数, 框架回调
module.exports = function(app_pool) {
		// route_saver 负责记录路由
  	var route_saver = mixer.create_route_saver();

// ---------------------------------------- ! 用户自定义 >
		var app = express();
		// route_saver(a) 返回a本身
		app.use(route_saver('/t1'), 		user_middleware('hello mid1'));
		app.use(route_saver('/tt/a'), 	user_middleware('hello mid2'));
		app.use(route_saver('/tt'), 		user_middleware('hello mid3'));

// ---------------------------------------- < 用户自定义 !
		// 在框架中注册应用
		var route = app_pool.addApp(mixer.express(app));
  	route.add(route_saver);
}


// 这段代码允许这个脚本独立运行
if (!module.parent) {
  var conf = {
    whenLoad: module.exports
  };

  mixer.create_http_mix_server(conf);
}


// ---------------------------------------- ! 用户自定义 >
// express 的中间件, 这个由用户实现
// 这个中间件简单的显示消息
function user_middleware(msg) {
  var count = 0;
  if (!msg) msg = 'count:';
  var f = function(req, res) {
    res.send('call:' + req.originalUrl + 
             '<br/><br/>' + msg + ' ' + (count+=1) +
             '<br/><br/>parms: <pre>' + JSON.stringify(req.query) + '</pre>');
  };
  return f;
}
// ---------------------------------------- < 用户自定义 !