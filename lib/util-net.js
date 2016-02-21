// 网络工具包
var url    = require('url');
var qs     = require('querystring');
var http   = require('http');
var https  = require('https');
var datlib = require('./util-data.js');

var send_type_map = {
  'json' : {
    mime: 'application/json',
    parse: function(d) {
      return JSON.stringify(d);
    }
  },

  'form' : {
    mime: 'application/x-www-form-urlencoded',
    parse: function(d) {
      return qs.stringify(d);
    }
  },

  'text' : {
    mime: 'text/html',
    parse: function(d) {
      return String(d);
    }
  }
};


/**
 * 使用 utf8 编码发送 HTTP.GET 请求
 * _url -- 请求url
 * parm -- 参数对象 JSON
 * cb   -- 完成后的回调: function(err, data);
 */
module.exports.get = function get(_url, parm, cb) {
  var targetUrl = url.parse(_url);

  if (targetUrl.query && parm) {
    targetUrl.path += "&" + qs.stringify(parm);
  } else if (parm) {
    targetUrl.path = targetUrl.pathname + '?' + qs.stringify(parm);
  }

  targetUrl.method = 'GET';
  return requestApi(targetUrl, null, cb);
};


/**
 * 使用 utf8 编码发送 HTTP.POST 请求
 * _url       -- 请求url
 * parm       -- 参数对象 JSON
 * cb         -- 完成后的回调: function(err, data);
 * _send_type -- form/json/text 默认是 form
 */
module.exports.post = function post(_url, parm, cb, _send_type) {
  var targetUrl = url.parse(_url);
  var send_parse = send_type_map[_send_type || 'form'];
  var content = send_parse.parse(parm);
  
  targetUrl.method = 'POST';
  targetUrl.headers = {
    "Content-Type"   : send_parse.mime,
    "Content-Length" : Buffer.byteLength(content)
  };

  return requestApi(targetUrl, content, cb);
};


function requestApi(targetUrl, content, when_over) {
  var protocol = targetUrl.protocol == 'http:' 
               ? http : https;

  var buffers = [];  
  var encodei = 'utf8';

  var request = protocol.request(targetUrl, function(response) {
    response.setEncoding(encodei);

    if (response.statusCode != 200) {
      var error = new Error('http(s) ret: ^' + response.statusCode + "~"
                + (response.statusMessage || ''));
      when_over(error);
      return;
    }

    response.on('data', function(data) {
      buffers.push(new Buffer(data, encodei));
    });

    response.on('end', function() {
      var retBuf = Buffer.concat(buffers);
      when_over(null, datlib.fromTxt( retBuf.toString(encodei) ));
    });
  });

  request.on('error', function(err) {
    when_over(err);
  });
  
  content && request.write(content);
  request.end();

  return request;
}