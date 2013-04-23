var level1 = require('./level1');

var db = level1.core({dbPath:'./log'});

level1.cli( {db:db});
level1.http({db:db});

