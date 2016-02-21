exports.init = loadThinkjs;

var callcout = 0;


function loadThinkjs(_conf) {
  if (callcout++) throw new Exception("只能加载一个 thinkjs 应用");

  var handle = function() {};
  var ret = function(req, res) {
    handle(req, res);
  };

  for (var name in _conf) {
    global[name] = _conf[name];
  }

  process.execArgv.push('--no-app');
  require('thinkjs');

  global.C('create_server_fn', function(_App) {
    var thinkHttp = thinkRequire('Http');

    handle = function(req, res) {
      thinkHttp(req, res).run().then(_App.listener);
    }
  });

  thinkRequire('App').run();

  return ret;
}
