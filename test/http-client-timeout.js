var http = require('http');

var server = http.createServer(function(req, resp) {
	console.log('server get require, but not response');
});
server.listen(800);


var req0 = http.request('http://localhost:800',
		function(resp0) {
			console.log('client request response');
		});
		
req0.on('error', function(e) {
	console.log('client err', e.message);
});

req0.setTimeout(1000, function(e) {
	console.log('client timeout', e);
	req0.abort();
});

req0.end();