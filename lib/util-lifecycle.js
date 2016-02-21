var Event  = require('events').EventEmitter;


module.exports.newLife = newLife;


var time_listener = [];
var __id = 1;
var min_wait_time = 1 * 1000;
setTimeout(doCheck, min_wait_time);

function doCheck() {
	try {
		for (var id in time_listener) {
			//
			// 如果注册的任务很多, 也不会因为使用循环而影响效率
			//
			process.nextTick(time_listener[id]);
		}
	} catch(err) {
		throw err;
	} finally {
		setTimeout(doCheck, min_wait_time);
	}
}

//
// 每当到达间隔时间, 且没有被 interrupt, 则执行任务 task_func
// interval_seconds 以秒为单位噢 !
//
// return {
//   // 调用该方法后直到下一个间隔时间到达才会执行任务
// 		interrupt: function(),
//   // 停止任务
//   stop: function()
// }
//
function newLife(interval_seconds, task_func) {
	var tid = ++__id;
	var begint;
	var ret = {};
	
	if (min_wait_time > interval_seconds && interval_seconds > 0) {
		min_wait_time = interval_seconds;
	}

	ret.interrupt = function() {
		begint = process.uptime();
	};

	ret.stop = function() {
		delete time_listener[tid];
	};

	ret.interrupt();
	
	//
	// 注册回调函数到全局
	//
	time_listener[tid] = function() {
		// console.log(now_time, begint, interval_seconds);
		if (process.uptime() >= begint + interval_seconds) {
			task_func();
			ret.interrupt();
		}
	}

	// 别名
	ret.update  = ret.interrupt;
	ret.skip    = ret.interrupt;
	ret.kill 		= ret.stop;
	ret.end 		= ret.stop;

	return ret;
}