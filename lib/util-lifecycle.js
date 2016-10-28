
module.exports.newLife = newLife;

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
	var tid;
	var begint;
	
	var ret = {
		interrupt : interrupt,
		update 		: interrupt,
		skip   		: interrupt,
		ret    		: stop,
		end    		: stop,
		stop   		: stop,
	};
		
	if (interval_seconds <= 0) {
		throw new Error('interval_seconds must >= 0');
	}

	begint = process.uptime();
	tid = setInterval(doCheck, interval_seconds * 1000);

	return ret;


	function interrupt() {
		begint = process.uptime() + interval_seconds + interval_seconds;
		//console.log('inter', begint);
	};

	function stop() {
		clearInterval(tid);
	};

	function doCheck() {
		//console.log(process.uptime(), begint, interval_seconds);
		if (process.uptime() >= begint) {
			begint = process.uptime() + interval_seconds;
			try {
				task_func();
			} catch(err) {
				console.error(err.stack);
			}
		}
	}
}