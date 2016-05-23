var mix = require('../index.js');
var lc  = mix.util.lifecycle();


t(1);
t(3);
t(5);


function t(n) {
	var life = lc.newLife(n, function() {
		console.log('call', n);
		//life.stop();
	});
}