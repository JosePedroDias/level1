var level1 = require('../../lib/index'); // github
//var level1 = require('level1');          // production



/**
 * This is a HTTP server that exposes the level1 core API
 *
 * Syntax is:
 * node run_level1_cli.js <database_name> [<port>]
 */

var port = 3000;
var dbPath;

var a = process.argv.pop();
if ( !isNaN( parseInt(a, 10) ) ) {
	port = parseInt(a, 10);
	dbPath = process.argv.pop();
}
else {
	dbPath = a;
}

level1.http({
    dbPath:  dbPath,
    port:    port,
    verbose: true
});
