var ex = module.exports = require('./lib/server-mixer.js');
ex.util = {};


// util 库的命名规范 util-xxx.js
// 引入时 `var xxx = require('mixer-lib').util.xxx();`
// 调用时 `xxx.yyy(...)`
// 导出时 `exportUtil('xxx');`
exportUtil('net');
exportUtil('data');
exportUtil('mid');
exportUtil('lifecycle');


// 原生 http 项目使用该方法
ex.native = function(_handle) {
	return _handle;
};

// express 项目使用该方法
ex.express = function(_handle) {
	return _handle;
};

// thinkjs 项目使用该方法
ex.thinkjs = function(_conf) {
	return require('./lib/for-thinkjs.js').init(_conf);
};


// 方便记录路由
ex.create_route_saver = function() {
	var route = [];

	var ret = function(r) {
		route.push(r);
		return r;
	}

	ret.getRoute = function() {
		return route;
	}

	ret.className = 'create_route_saver';

	return ret;
}


function exportUtil(_name) {
	ex.util[_name] = function() {
		return require('./lib/util-' + _name + '.js');
	};
}