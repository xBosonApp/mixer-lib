var logger  = require('logger-lib')('mixer');
var url     = require('url');
var config  = require('configuration-lib');
var path    = require('path');
var Event   = require('events');
var util    = require('./util.js');


module.exports = {
  create_http_mix_server : create_http_mix_server,
  write_pid              : writePid,
  auto_init              : auto_init,
  print_license          : print_license,
};


function auto_init(whenLoad, ext_data) {
  var HEAD = 'Mixer::AUTO_INIT';
  // !! 如变更文件关系, 需要修改变量的获取
  var target = module.parent.parent.parent;

  if (!target.parent) {
    logger.info(HEAD, 'Read/Save config and start http server');
    config.auto_init(function(conf) {
      conf.whenLoad = whenLoad;
      create_http_mix_server(conf, ext_data);
    });
  }
  else if (util.isEmptyObj(target.exports)) {
    logger.info(HEAD, '(', target.filename, ') Only Export ths whenLoad() Function');
    target.exports = whenLoad;
  }
  else {
    logger.info(HEAD, '(', target.filename, ') Do nothing');
  }
}


/**
 * 创建服务器并运行
 */
function create_http_mix_server(conf, exdata) {
  conf = util.extends(config.load(), conf);
  if (typeof conf.whenLoad != 'function')
      throw new Error('where is "whenLoad" function ?');

  if (undefined === conf.port)
      conf.port = 80;

  print_license();
  writePid(conf);

  if (conf.cluster) {
    var cluster_manager = require('./cluster.js').cluster_manager;

    cluster_manager(conf.cluster, function() {
      logger.debug('Cluster Master is running, but not http service.');
    }, function() {
      create_server(conf, exdata);
    });

  } else /* conf.cluster == false */ {
    create_server(conf, exdata);
  }
}


function print_license() {
  try {
    var fs = require('fs');
    var lic = require('program-crypto-lib').lic();
    var file = lic.getLicenseFile();
    var config, log;

    // base64 编码没有 'license' 字符串, 仅在加密程序中打印授权信息.
    if (file.indexOf('license') < 0) {
      file = Buffer.from(file, 'base64').toString('utf8');
      var content = fs.readFileSync(file, 'utf8');
      config = lic.check_license(content);
      log = logger.info;
    } else {
      return; // 仅用于测试

      var content = fs.readFileSync(file, 'utf8');
      config = JSON.parse(content);
      log = logger.debug;
    }

    log('[' + config.appname + ']', '授权给', '[' + config.company + ']');
    log('授权日期', config['begin-date'], '~', config['end-date']);
  } catch(e) {
    /* do nothing.. */
    logger.debug('Print License fail.', e.message);
  }
}


function writePid(conf) {
  var pidlog = logger('pid');

  if (conf.cluster) {
    var cluster = require('cluster');

    if (cluster.isMaster) {
      pidlog.info('Master', process.pid);
    } else {
      pidlog.info('Work', process.pid);
    }
  } else {
    pidlog.info('Main', process.pid);
  }
}


function create_app_pool(route, loadApp) {
  var app_pool = new Event();

  app_pool.addApp = function(app_adapter, route_obj) {
    if (!app_adapter) throw new Error('arg[0] app_adapter is null');
    
    var ret = addCheckType;
    ret.add = addCheckType;
    if (route_obj)
      addCheckType(route_obj);

  return ret;

    function _addString(_path) {
      if (!_path)
        throw new Error("路由不能空");

      if (route[_path])
        throw new Error("路由冲突: [" + _path + "] 已经存在.");

      if (_path == '/')
        logger.warn("注册了根路由 '/'");

      route[_path] = app_adapter;
    }

    function _addArray(_path_array) {
      for (var i = _path_array.length-1; i>=0; --i) {
        _addString(_path_array[i]);
      }
    }

    function addCheckType(obj) {
      if (typeof obj == 'string') {
        _addString(obj);
      }
      else if (obj.className == 'create_route_saver') {
        _addArray(obj.getRoute());
      }
      else if (obj.length > 0) {
        _addArray(obj);
      }
      else {
        throw new Error("参数无效:" + app_adapter);
      }
    }
  }

  app_pool.route_list = function() {
    var ret = [];
    for (var n in route) {
      ret.push(n);
    }
    return ret;
  }

  app_pool.removeApp = function(_path) {
    delete route[_path];
  };

  app_pool.reload = function() {
    logger.debug('重新加载应用...');

    try {
      module.constructor._cache = {};
    } catch(err) {
      logger.error('清除程序缓存失败, 无法加载最新程序代码');
    }

    app_pool.emit('beforeEnd');
    loadApp();
    app_pool.emit('afterReload');

    logger.debug('应用重新加载成功');
  };

  return app_pool;
}


function create_server(conf, exdata) {
  var route = {};
  var app_pool = create_app_pool(route, loadApp);
  var server;

	app_pool.port = conf.port;
  app_pool.emit('beforeFirstLoad');
  loadApp();
  app_pool.emit('afterFirstLoad');

  if (conf.ssl) {
    var https = require('https');
    server = https.createServer(conf.ssl, listener);
  } else {
    var http = require('http');
    server = http.createServer(listener);
  }

  try {
    server.on('clientError', function(exception, socket) {
      if (exception.code == 'ECONNRESET')
        return;
      logger.debug('clientError', exception.message);
    });

    server.listen(conf.port, function() {
      var addr = server.address();
      logger.info('Listening on --', addr, '**');
      app_pool.port = addr.port;
    });

    server.on('error', function(e) {
      if (e.code === 'EADDRINUSE' && app_pool.listenerCount('error') < 1) {
        process.exit(util.EADDRINUSE);
      }
      app_pool.emit('error', e.message);
    });

    //
    // 在服务器启动之后抓取异常, 否则会导致
    // 服务器未启动而进程还在运行的情况
    //
    process.on('uncaughtException', function (err) {
      logger.error('uncaughtException', err);
    });
  } catch(E) {
    logger.error("** 创建服务器失败:", E, JSON.stringify(conf));

    if (app_pool.listenerCount('err_no_start') > 0) {
      app_pool.emit('err_no_start');
    } else {
      throw E;
    }
  }


  function loadApp() {
    for (var n in route) {
      delete route[n];
    }
    conf.whenLoad(app_pool, exdata, conf);
  }


  function listener(req, res) {
    var pt    = null;
    var npt   = url.parse(req.url).pathname;
    var orgpt = npt;

    do {
      pt = npt;

      if (route[pt]) {
        var stime = process.hrtime();
        req.base = pt;
        route[pt](req, res, last_handle);

        res.once('finish', function() {
          var diff = process.hrtime(stime);
          var use  = diff[0] * 1e3 + diff[1] / 1e6;
          logger.debug("[", pt, "\t] <<<", orgpt, use, 'ms');
        });
        return;
      }
      var npt = path.dirname(pt);
    } while (npt != pt);

    var msg = 'Invalid path: ' + orgpt;
    logger.info(msg);
    last_handle(msg);

    function last_handle(err, _msg) {
      if (err) {
        res.statusCode = 500;
        res.statusMessage = err.message || err;
        res.end(err.stack || err);
      } else if (_msg) {
        res.end(_msg + '');
      } else {
        res.statusCode = 404;
        res.statusMessage = 'Not found';
        res.end();
      }
    }
  }
}
