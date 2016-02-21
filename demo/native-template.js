/* ------------------------------------- *!
  这个模板复制到项目中改名, 作为启动脚本
  复制 config/config.js 目录和文件到项目中
  mixer 会读取其中配置, 创建 logs 日志目录
  引入 logger-lib 作为日志输出组件
  引入 configuration-lib 作为配置组件
// ------------------------------------- */ 

var mixer = require('../index.js'); // require('mixer-lib')


// 导出函数, 框架回调
module.exports = function(app_pool) {
// ---------------------------------------- ! 用户自定义 >
  // 路由收集器的使用参考 express-template.js
	// 创建一个应用
  var route1 = app_pool.addApp( mixer.native( native_http() ) );

  // 插入路由的四种方法
  route1.add('/a/b/c');
  route1.add(['/b','/c']); 
  route1('/c/d');
  route1(['/s', '/']);
// ---------------------------------------- < 用户自定义 !
}


// 这段代码允许这个脚本独立运行
if (!module.parent) {
  var conf = {
    whenLoad: module.exports
  };

  mixer.create_http_mix_server(conf);
}

// ---------------------------------------- ! 用户自定义 >
// 应用程序的逻辑, 用户自己定义
function native_http() {
  var count = 0;

  return function(req, res) {
    res.end('hello native ' + (++count) + " [" + req.url + "]");
  }
}
// ---------------------------------------- < 用户自定义 !