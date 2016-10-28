var mix = require('../index.js');
var lc  = mix.util.lifecycle();

var begin = process.uptime();
t(1);
t(3);
t(5);


function t(n) {
	var a = 1;
	var life = lc.newLife(n, function() {
		console.log('call', n, '(', a, ')', (process.uptime()-begin).toFixed(1) );
		if (a % 3 == 0) {
			life.skip();
		}
		a += n;
	});
}