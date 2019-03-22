var cl = require('../lib/cluster.js');


var cl_conf = {
  thcount : 3,
  // process_timeout : 5000,
};


cl.cluster_manager(cl_conf, function() {
  console.log('# Master start');
  var c = 0;
  setInterval(function() {
    console.log('#', ++c);
  }, 1000);

}, function(conf, addr, worker, port) {
  console.log('$ Work start', worker.id);

  // 2 号进程退出
  if (worker.id == 2) {
    setTimeout(function() {
      process.exit(0);
    }, 2000);
  }

  // 3 号进程死循环, 会被 kill
  if (worker.id == 3) {
    // 死循环
    for (;;) ;
  }
});


process.on('exit', function() {
  console.log('exit');
});
