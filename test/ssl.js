var mixer = require('../');
var fs = require("fs");
var https = require('https');

var opt = {
  whenLoad : whenLoad, 
  port     : '443',
  ssl      : {
    key  : fs.readFileSync(__dirname + '/privatekey.pem', 'utf8'),
    cert : fs.readFileSync(__dirname + '/certificate.pem', 'utf8'),
    // vert : fs.readFileSync(__dirname + '/certificate.pem', 'utf8'),
  }
};

mixer.create_http_mix_server(opt);

function whenLoad(app_pool, exdata) {
  var sinopia_route = app_pool.addApp(function(req, resp) {
    resp.end('ok');
  });
  sinopia_route.add('/');
}
