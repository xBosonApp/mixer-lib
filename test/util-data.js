var mix = require('../index.js');
var dat = mix.util.data();
var fs  = require('fs');


var d = dat.fromTxt('{"ret":"1", "msg":{"hello":"world"}, "data":[99, {"b":"1"} ] }');
pldat(d);


var d2 = dat.fromObj({
	c:1234, 
	a:{ 
		c:{ 
			_attr_ : {
				a1: "abc", a2: '123'
			},
			d:"abc", 
			e:"aaaa" 
		}
	} ,
	b:[1,2,3]
});
pldat(d2);


fs.readFile(__dirname +'/' + "2.xml", function(err, data) {
	if (err) {
		console.error(err);
		return;
	}
  var _xml = data.toString();

	var d3 = dat.fromXml(_xml);
	//pldat(d3);
});


function pldat(d) {
	console.log('txt:', d.txt()  );
	console.log('obj:', d.obj() );
	console.log('xml:', d.xml()  );
	console.log("\n");
}