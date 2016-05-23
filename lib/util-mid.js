var fs 		= require('fs');
var path 	= require('path');
var mime  = require('mime');
var url   = require('url');
var logger= require('logger-lib');


module.exports.ex_check_url = check_url;
module.exports.ex_static = ex_static;
module.exports.ex_log = ex_log;


//
// 静态文件中间件 for express
//
function ex_static(local_base, url_prefix, isAbsPath) {
	var base = isAbsPath ? local_base 
	         : path.join(process.cwd(), local_base);

	return check_url(url_prefix, function(res, rep, next) {
		var filepath = path.join(base, res.path.substr(url_prefix.length));

		fs.readFile(filepath, function (err, data) {
		  if (err) {
		  	console.error('ex_static', err);
		  	next();
		  	return;
		  }

			var type = mime.lookup(filepath); 
		  rep.setHeader("Content-Type", type);
		  rep.end(data);
		});
	});
};


//
// 日志查看中间件 for express
// ! 迁移到 logger 中
//
function ex_log() {
	return logger.mid.log();
}


//
// 检查 url 前缀
//
function check_url(url_prefix, success_mid) {
	if (!url_prefix) {
		throw new Error("must have `url_prefix` parameter");
	}

	var succ, fail;

	if (success_mid) {
		succ = function(res, rep, next) {
			success_mid(res, rep, next);
		};
		fail = function(res, rep, next) { next && next(); }
	} else {
		succ = function(res, rep, next) { next && next(); };
		fail = function(res, rep, next) { /* do nothing */ };
	}

	return function(res, rep, next) {
		if (res.url.indexOf(url_prefix) == 0) {
			succ(res, rep, next);
		} else {
			fail(res, rep, next);
		}	
	}
}