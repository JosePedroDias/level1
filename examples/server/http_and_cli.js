var level1 = require('../../lib/index'); // github
//var level1 = require('level1');          // production

var db = level1.core({
	dbPath:'./log',
	interceptor: function(v, k) {
		if ('age' in v) { v.age = parseInt(v.age, 10); }
		return [v, k];
	}
});

db.on('ready', function() { console.log('* READY'); });
//db.on('closed', function() { console.log('* CLOSED'); });
db.on('put', function(k, v) { console.log('* PUT: ', k, '->\n', v); });
db.on('del', function(k) { console.log('* DEL: ', k); });

level1.cli( {db:db});
level1.http({db:db});
