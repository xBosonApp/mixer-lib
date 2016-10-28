var mixer = require('../index.js');
var mid = mixer.util.mid();


mixer.auto_init(function whenLoad(app_pool, exdata, config) {
  // http://localhost:81/file/1.html
  app_pool.addApp(mid.ex_static('./test'), '/file');
  // http://localhost:81/log
  app_pool.addApp(mid.ex_log(), '/log');
  // http://localhost:81/reload 
  app_pool.addApp(mid.ex_reload(app_pool), '/reload');
});