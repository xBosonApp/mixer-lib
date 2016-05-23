var mixer   = require('../index.js');
var express = require('express');
var logger  = require('logger-lib');

// ---------------------------------------------------------
// **** 引入多种应用, 这些引入的脚本由客户实现
var ex_app = require('./express-template.js');
var nv_app = require('./native-template.js');
var tk_app = require('./thinkjs-template.js');


// ---------------------------------------------------------
// **** 设置应用混合器
var conf = {};

// 在 create_http_mix_server() 中, 该方法被回调, 进行初始化
conf.whenLoad = function(app_pool) {
  ex_app(app_pool);
  nv_app(app_pool);
  tk_app(app_pool);

  logger.info("routes: ", app_pool.route_list());
};


mixer.create_http_mix_server(conf);