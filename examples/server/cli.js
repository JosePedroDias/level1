var level1 = require('../../lib/index'); // github
//var level1 = require('level1');          // production



/**
 * This is a command-line client that uses level1
 *
 * Syntax is:
 * node run_level1_cli.js <database_name>
 */

var dbPath = process.argv.pop();

level1.cli({
    dbPath:  dbPath
});
