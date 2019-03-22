var cluster = require('cluster');
var util    = require('./util.js');
var os      = require('os');
var cp      = require('child_process');
var spawn   = cp.spawn;
var exec    = cp.exec;


module.exports = {
  cluster_manager   : cluster_manager,
  get_thread_count  : get_thread_count,
};


var BEAT_HEART_DELAY = 40 * 1000;
var START_WORK_DELAY = 200;
var PING = 'ping';
var PONG = 'pong';


function cluster_manager(conf, master_work, slaver_work) {
  var logger  = require('logger-lib')('mixer-cluster');
  var config  = require('configuration-lib');

  var env           = { $autoport: 0 };
  var worker_count  = 0;
  var thcount       = 0;
  // 只有前一个进程启动 tcp 服务并在主进程获取 listening 事件后才启动新的进程
  var run_on_listenning = false;
  var process_timeout;

  if (!master_work)
    throw new Error('master_work function not null');

  if (!slaver_work)
    slaver_work = master_work;


  if (cluster.isMaster) {
    var beat_hearts = {};

    if (!isNaN(conf)) {
      thcount = conf;
    }
    else if (typeof conf == 'object') {
      thcount           = conf.thcount;
      run_on_listenning = conf.run_on_listenning;
      process_timeout   = conf.process_timeout || BEAT_HEART_DELAY;
    }

    thcount = get_thread_count(thcount);
    config.auto_init(master_work);
    if (thcount <= 1) return;

    logger.log('启动集群', thcount, '个');
    new_worker();


    cluster.on('fork', function(worker) {
      ++worker_count;
      if (!run_on_listenning) {
        new_worker();
      }
    });

    cluster.on('exit', function(worker, code, signal) {
      if (code === util.EADDRINUSE) {
        env.$autoport += 1;
      }
      var bh = beat_hearts[worker.id];
      bh.stop_beat_heart();

      logger.log('Worker', worker.process.pid, 'died', code, signal);
      --worker_count;
      new_worker();
    });

    cluster.on('listening', function(worker, _address) {
      env.$autoport = _address.port + 1;
      env.$address = JSON.stringify(_address);
      if (run_on_listenning) {
        new_worker();
      }
    });


    function create_beat_heart(worker) {
      var wait_time = parseInt( process_timeout /2 );
      var beat_heart_tid;
      var check_timeout_tid;

      delay_send_beat();

      // cluster.on('message', recv_bea?t);
      worker.on('message', recv_beat);

      function recv_beat(m) {
        if (m == PONG) {
          // console.log('< Master recv pong', worker.id, worker.process.pid);
          clearTimeout(check_timeout_tid);
          delay_send_beat();
        }
      }

      function delay_send_beat() {
        beat_heart_tid = setTimeout(beat_heart, wait_time);
      }

      function beat_heart() {
        if (worker.isDead()) return stop();
        // console.log('> Master send ping', worker.id, worker.process.pid);
        worker.send(PING);
        check_timeout_tid = setTimeout(function() {
          logger.warn('检测到工作进程无响应, ID:',
              worker.id, "PID:", worker.process.pid, '重启..');
          stop();
          kill(worker);
        }, process_timeout);
      }

      function stop() {
        clearTimeout(beat_heart_tid);
        clearTimeout(check_timeout_tid);
        process.removeListener(PONG, recv_beat);
      };

      return stop;
    }


    function new_worker() {
      if (worker_count < thcount) {
        setTimeout(function() {
          var worker = cluster.fork(env);
          beat_hearts[ worker.id ] = {
            stop_beat_heart : create_beat_heart(worker),
          };
        }, START_WORK_DELAY);
      }
    }

  } else {
    config.wait_init(function(conf) {
      var addr = process.env.$address;
      var auto_port = parseInt(process.env.$autoport);
      if (addr) addr = JSON.parse(addr);

      slaver_work(conf, addr, cluster.worker, auto_port);
    });

    process.on('message', function(m) {
      if (m == PING) {
        // console.log('^ worker recv ping, send pong', process.pid)
        process.send(PONG);
      }
    });
  }
}


function kill(worker) {
  if (os.platform() == 'win32') {
    exec('taskkill /T /F /pid ' + worker.process.pid);
  } else {
    worker.kill('SIGKILL');
  }
}


//
// 线程数量策略
//
function get_thread_count(thcount) {
  var numCPUs = require('os').cpus().length;
  if (isNaN(thcount)) {
    if (thcount) {
      thcount = numCPUs;
    } else {
      thcount = 1;
    }
  } else if (thcount <= 0) {
    thcount = numCPUs + (thcount % numCPUs);
  } else if (thcount < 1) {
    thcount = thcount * numCPUs;
  }
  return thcount;
}
