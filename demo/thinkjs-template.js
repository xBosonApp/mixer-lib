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
	// 只能初始化一个 thinkjs 项目!
	// APP_PATH: 指定 thinkjs 项目目录
  var think_conf = { APP_PATH: 'think_test' };
  var tkroute = app_pool.addApp(mixer.thinkjs(think_conf));
  // 注册路由
  tkroute.add('/tk');
// ---------------------------------------- < 用户自定义 !
}


// 这段代码允许这个脚本独立运行
if (!module.parent) {
  var conf = {
    whenLoad: module.exports
  };

  mixer.create_http_mix_server(conf);
}