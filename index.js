var ex = module.exports;
var util = ex.util = require('./lib/util.js');
	

util.bind('route.js', ex);
util.bind('server-mixer.js', ex);
util.bind('compatible.js', ex);

	
util.dynamicBind('net');
util.dynamicBind('data');
util.dynamicBind('mid');
util.dynamicBind('lifecycle');
