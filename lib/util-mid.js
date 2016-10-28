var fs 		 = require('fs');
var path  = require('path');
var mime   = require('mime');
var url    = require('url');
var logger = require('logger-lib');


module.exports = {
	ex_static 	 : ex_static,
	ex_log 			 : ex_log,
	ex_reload    : reload,
};


//
// 重启服务, 每次重启的密码随机生成
// 无参请求服务会在控制台打印密码
//
function reload(app_pool) {
	var crypto = require('crypto');
	var password;
	var count;
	
	gen_ps();
	
	return function(res, rep, next) {
		var ud = url.parse(res.url, true);
		var ps = ud.query.ps;
		var msg;
		
		if (ps) {
			if (ps == password) {
				gen_ps();
				setImmediate(app_pool.reload);
				msg = 'reload';
			} else {
				msg = 'fail';
			}
		} else {
			console.log('---- Reload password is [', password, ']');
			msg = '';
		}
	
		if (--count < 0) 
			gen_ps();
	
		rep.end('<html><form action="#"/><input name="ps" size="40"/>'
				+ '<input type="submit"/></form></html>' + msg);
	}

	function gen_ps() {
		count = 5000;
		password = crypto.pseudoRandomBytes(32).toString('base64');
	}
}


//
// 静态文件中间件 for express
//
function ex_static(local_base, isAbsPath) {
	var base = isAbsPath ? local_base 
	         : path.join(process.cwd(), local_base);

	return function(res, rep, next) {
		var urldat = url.parse(res.url, true);
		var filepath = path.join(base, urldat.path.substr(res.base.length));
		
		if (filepath.indexOf('..') >= 0) {
			next(new Error('bad path'));
			return;
		}

		fs.readFile(filepath, function (err, data) {
		  if (err) {
		  	console.error('ex_static', err.message);
		  	next(err);
		  	return;
		  }

			var type = mime.lookup(filepath); 
		  rep.setHeader("Content-Type", type);
		  rep.end(data);
		});
	}
};


//
// 日志查看中间件 for express
// ! 迁移到 logger 中
//
function ex_log(base, bootstrap) {
	var srv = logger.mid.log(bootstrap);
	return function(req, resp) {
		var urldat = url.parse(req.url, true);
		srv(req, resp);
	};
}
