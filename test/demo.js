var mixer   = require('../index.js');
var express = require('express');
var logger  = require('logger-lib');


// demo2();
demo1();


// ---------------------------------------------------------
// **** 设置应用混合器
function whenLoad(app_pool) {
// ---------------------------------------------------------
// **** 引入多种应用, 这些引入的脚本由客户实现
  var ex_app = require('./express-template.js');
  var nv_app = require('./native-template.js');
  //var tk_app = require('./thinkjs-template.js');

  ex_app(app_pool);
  nv_app(app_pool);
  //tk_app(app_pool);
  app_pool.addApp(reload(app_pool.reload), '/reload');

  app_pool.on('afterFirstLoad', function() {
    logger.info("routes: ", app_pool.route_list());
  });
};


function reload(re) {
  return function(req, resp, next) {
    logger.info('reload');
    re();
    next(null, 'reload');
  };
}


function demo1() {
  var conf = {};
  // 在 create_http_mix_server() 中, 该方法被回调, 进行初始化
  conf.whenLoad = whenLoad;
  // conf.cluster = 0.5;
  // conf.cluster = -22;
  // conf.cluster = 2;
  mixer.create_http_mix_server(conf);
}


function demo2() {
  mixer.auto_init(whenLoad);
}
