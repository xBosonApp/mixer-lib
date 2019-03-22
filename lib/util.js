module.exports = {
  dynamicBind : dynamicBind,
  bind        : bind,
  isEmptyObj  : isEmptyObj,
  extends     : _extends,

  EADDRINUSE  : 98,
};


//
// util 库的命名规范 util-[_name].js
// 导出时 `exportUtil([_name]);`
// 引入时 `var [_name] = require('mixer-lib').util.[_name]();`
// 调用时 `[_name].Function(...)`
//
function dynamicBind(_name) {
	this[_name] = function() {
		return require('./util-' + _name + '.js');
	};
}


function bind(libpath, obj) {
	var lib = require('./' + libpath);
	for (var n in lib) {
		if (obj[n])
			throw new Error('conflicts ' + n);
		obj[n] = lib[n];
	}
}


function isEmptyObj(obj) {
  var isemp = true;
  if (obj && obj.constructor === Object) {
    for (var n in obj) {
      isemp = false;
      break;
    }
  }
  return isemp;
}


function _extends(base, from) {
  if (!base) base = {};
  for (var n in from) {
    base[n] = from[n];
  }
  return base;
}
