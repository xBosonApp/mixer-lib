var mix = require('../index.js');
var net = mix.util.net();

console.log('[test net]');

var url = 'http://www.baidu.com';

url = 'http://192.168.7.144:8012/eeb/service?fn=testhttp';

var body = {
  a:1, b:2000
  // , fn: 'testhttp'
};

var method = 'post';

net[method](url, body, function(err, data) {
	console.log('RET:', err, data && data.txt());
}, 'json');