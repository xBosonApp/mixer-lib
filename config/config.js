var _config = {
	logLevel 		: 'ALL',
  // 服务器端口号
	port 				: 81,
  // 集群配置:
  //  5     设置为5个进程;
  //  0.5   使用一半数量的处理器,
  //  -2    留出 2 个空闲处理器
  //  true  使用全部处理器, 或设置 0
  //  false 单进程
	cluster 		: false
};

module.exports = _config;
