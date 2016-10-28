var logger  = require('logger-lib')('mixer');

exports.init = loadThinkjs;

var callcout = 0;
var reqerr = "Inition `thinkjs` FAIL.";


function loadThinkjs(_conf) {
  if (callcout++) throw new Exception("只能加载一个 thinkjs 应用");

  var handle = function(req, resp) {
    logger.error(reqerr);
    resp.end(reqerr);
  };

  var ret = function(req, res) {
    handle(req, res);
  };

  try {
    require('thinkjs');
    
    for (var name in _conf) {
      global[name] = _conf[name];
    }

    process.execArgv.push('--no-app');

    global.C('create_server_fn', function(_App) {
      var thinkHttp = thinkRequire('Http');

      handle = function(req, res) {
        thinkHttp(req, res).run().then(_App.listener);
      }
    });

    thinkRequire('App').run();
  } catch(err) {
    logger.error(reqerr, err);
  }

  return ret;
}
