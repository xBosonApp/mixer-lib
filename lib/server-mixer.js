var logger  = require('logger-lib')('mixer');
var http    = require('http');
var url     = require('url');
var config  = require('configuration-lib');
var path    = require('path');


module.exports.create_http_mix_server = create_http_mix_server;
module.exports.write_pid = writePid;


/**
 * 创建服务器并运行
 */
function create_http_mix_server(conf, exdata) {
  conf = config.extends(config.load(), conf);
  if (!conf.port) conf.port = 80;
  writePid(conf);

  if (conf.cluster) {
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
      logger.log('启动集群 ' + numCPUs);

      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        logger.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
      });
    } else {
      create_server(conf, exdata);
    }

  } else /* conf.cluster == false */ {
    create_server(conf, exdata);
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


function create_app_pool(route, _reload_app) {
  var app_pool = {};

  app_pool.addApp = function(app_adapter) {

    function _add(_path) {
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
        _add(_path_array[i]);
      }
    }

    function add(obj) {
      if (typeof obj == 'string') {
        _add(obj);
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

    var ret = add;
    ret.add = add;
    return ret;
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

    _reload_app();

    logger.debug('应用重新加载成功');
  };

  return app_pool;
}


function create_server(conf, exdata) {
  var route = {};
  var app_pool = create_app_pool(route, loadApp);
  var _loading = false;

  loadApp();


  function loadApp() {
    if (_loading) return;
    _loading = true;

    for (var n in route) {
      delete route[n];
    }
    conf.whenLoad(app_pool, exdata);

    _loading = false;
  }


  //todo 处理 http_middlewares
  var server = http.createServer(function(req, res) {
    var pt    = null;
    var npt   = url.parse(req.url).pathname;
    var orgpt = npt;

    do {
      pt = npt;

      if (route[pt]) {
        logger.debug("[", pt, "\t] <<<", req.url);
        route[pt](req, res, last_handle);
        return;
      }
      var npt = path.dirname(pt);
    } while (npt != pt);

    var msg = 'Invalid path: ' + orgpt;
    logger.info(msg);
    last_handle(msg);
    
    function last_handle(_msg) {
      res.statusCode = 404;
      res.statusMessage = 'Not found';
      res.end(_msg && _msg.toString());
    }
  });


  try {
    server.on('clientError', function(exception, socket) {
      logger.error('clientError', exception);
    });

    server.listen(conf.port, function() {
      logger.info('Listening on', server.address());
    });

    //
    // 在服务器启动之后抓取异常, 否则会导致
    // 服务器未启动而进程还在运行的情况
    //
    process.on('uncaughtException', function (err) {
      logger.error('uncaughtException', err);
    });
  } catch(E) {
    logger.error("创建服务器失败:", E, JSON.stringify(conf));
  }
}
