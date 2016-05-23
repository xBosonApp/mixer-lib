var mix = require('../index.js');
var mid = mix.util.mid();
var express = require('express');

var app = express();

app.use(mid.ex_static('./test', '/a'));

app.use('/cron/log', mid.ex_log());

app.listen(8000);