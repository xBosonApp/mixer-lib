var ex = module.exports;

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
	return require('./for-thinkjs.js').init(_conf);
};

// dish-lib 项目使用该方法  
ex.dish = function(_handle) {
	return _handle;
};