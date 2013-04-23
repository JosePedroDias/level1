'use strict';

var level1_core = require('./level1_core'),
    readline    = require('readline');



var parseIfPossible = function(val) {
    try {
        val = JSON.parse(val);
    } catch (ex) {}
    return val;
};



var level1_cli = function(cfg) {
    if (!cfg) {
        cfg = {};
    }

    if ( !('dbPath' in cfg || 'db' in cfg) ) {
        throw new TypeError('level1.cli() expects one of: dbPath (string) or db (core instance) to be defined!');
    }

    if (!('verbose' in cfg)) {
        cfg.verbose = false;
    }



    console.log('cli - using ' + (cfg.dbPath ? cfg.dbPath : 'direct instance') );

    var db = cfg.db || level1_core({dbPath:cfg.dbPath});



    var rl = readline.createInterface({
        input:  process.stdin,
        output: process.stdout
    });

    rl.on('line', function(cmd) {
        cmd = cmd.split(' ');
        var op = cmd.shift();
        var key;

        switch (op) {
            case 'add':
                key = db.put( parseIfPossible( cmd.join(' ') ) );
                console.log('data added to key ' + key + '\n');
                break;

            case 'put':
                key = cmd.shift();
                db.put( parseIfPossible( cmd.join(' ') ) , key);
                console.log('data set on key ' + key + '\n');
                break;

            case 'get':
                key = cmd.shift();
                db.get(key, function(err, val) {
                    if (err) { return console.log(err.message+'\n'); }
                    console.log(JSON.stringify(val, null, '\t') + '\n');
                });
                break;

            case 'del':
                key = cmd.shift();
                db.del(key, function(err) {
                if (err) { return console.log(err.message+'\n'); }
                    console.log('deleted.\n');
                });
                break;

            case 'list':
            case 'search':
                (function() {
                    var fn, fnBody = cmd.length ? cmd.join(' ') : 'return true;';

                    if (fnBody.indexOf('return') === -1) {
                        fnBody = 'return ' + fnBody;
                    }

                    try {
                        fn = new Function('v', 'k', fnBody);
                    } catch (err) {
                        return console.log('ERR:' + err);
                    }

                    db.search(fn, function(err, res) {
                        if (err) { return console.log(err.message+'\n'); }
                        var r = [];
                        res.forEach(function(kv) {
                            r = r.concat('* ', kv.key, ' -> ', JSON.stringify(kv.value, null, '\t'), '\n');
                        });
                        r = r.concat('TOTAL: ', res.length, '\n');
                        console.log(r.join(''));
                    });
                })();
                break;

            case 'keys':
                db.keys(function(err, keys) {
                    if (err) { return console.log('ERR:', err, '\n'); }
                    var r = [];
                    keys.forEach(function(key) {
                        r = r.concat('* ', key, '\n');
                    });
                    r = r.concat('TOTAL: ', keys.length, '\n');
                    console.log(r.join(''));
                });
                break;

            case 'values':
                db.values(function(err, values) {
                    if (err) { return console.log('ERR:', err, '\n'); }
                    var r = [];
                    values.forEach(function(val) {
                        r = r.concat(JSON.stringify(val, null, '\t'), '\n\n');
                    });
                    r = r.concat('TOTAL: ', values.length, '\n');
                    console.log(r.join(''));
                });
                break;

            case 'clear':
                db.clear(function(err) {
                    if (err) { return console.log('ERR:', err, '\n'); }
                    console.log('cleared.\n');
                });
                break;

            default:
                console.log([
                    'Supported operations are:\n',
                    '* add <data goes here>\n',
                    '* put <key> <data goes here>\n',
                    '* get <key>\n',
                    '* del <key>\n',
                    '* list\n',
                    '* search <function body, receiving arguments v, k and returning boolean>\n',
                    '* clear\n',
                    '* keys\n',
                    '* values\n\n'
                ].join(''));
        }
    });

};


module.exports = level1_cli;
