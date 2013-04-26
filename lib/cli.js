'use strict';

var readline    = require('readline'),
    fs          = require('fs'),
    level1_core = require('./core');



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



    var isTrue = function(a) {
        if (isNaN(a)) {
            return (a !== 'false' && a !== '' && a !== null && a !== undefined);
        }
        return a !== '0';
    };



    /*****************
     * NOW
     *****************/

    var sec = 1000;
    var min = sec * 60;
    var hour = min * 60;
    var day = hour * 24;
    var week = day * 7;
    var year = day * 365.25;
    var mon = year / 12;

    var times = {
        s:      sec,
        sec:    sec,
        second: sec,
        m:      min,
        min:    min,
        minute: min,
        h:      hour,
        hour:   hour,
        d:      day,
        day:    day,
        w:      week,
        week:   week,
        y:      year,
        year:   year,
        M:      mon,
        mon:    mon,
        month:  mon
    };

    var timeRgx = /([+-])?\s*(\d*\.?\d*)+\s*(\w+)/g;

    var now = function(expr) {
        /*jshint boss:true */
        //console.log(expr);
        var m, ts = new Date().valueOf();
        var dts = 0;
        var sign, mult, step;
        var isDiff = true;
        while (m = timeRgx.exec(expr) ) {
            if (m[1] === undefined && dts === 0) { isDiff = false; }
            //console.log(m[1], m[2], m[3]);
            sign = (m[1] === '-') ? -1 : 1;
            mult = (m[2] === undefined || m[2] === '') ? 1 : parseFloat(m[2]);
            step = times[ m[3] ];
            dts += mult * mult * step;
            //console.log(sign, mult, step, dts);
        }
        timeRgx.lastIndex = 0;
        return Math.round( isDiff ? ts + dts : dts );
    };

    /*****************
     * REDUCE
     *****************/

     // ANY AttrS

    var countAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (attrVal in res) {
                    ++res[attrVal];
                }
                else {
                    res[attrVal] = 1;
                }
                return res;
            },
            {}
        ];
    };

    var topAttr = function(attrName, bottom, n) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (attrVal in res) {
                    ++res[attrVal];
                }
                else {
                    res[attrVal] = 1;
                }
                return res;
            },
            {},
            function(res) {
                var k, res2 = [];
                for (k in res) {
                    res2.push( [k, res[k]] );
                }
                var getter = function(r) { return r[1]; };
                var cmp = bottom ?
                    function(a, b) { return getter(a) - getter(b); } :
                    function(a, b) { return getter(b) - getter(a); };
                res2.sort(cmp);
                if (typeof n === 'number') {
                    var l = res2.length;
                    console.log(n, l - n);
                    res2.splice(n, l - n);
                }
                return res2;
            }
        ];
    };

    var uniqueAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (attrVal in res) {
                    ++res[attrVal];
                }
                else {
                    res[attrVal] = 1;
                }
                return res;
            },
            {},
            function(res) {
                return Object.keys(res).sort();
            }
        ];
    };



    // AttrS
    
    var uniqueAttrs = function() {
        return [
            function(res, el) {
                for (var k in el) {
                    res[k] = true;
                }
                return res;
            },
            {},
            function(res) {
                return Object.keys(res).sort();
            }
        ];
    };



    // NUMBER AttrS

    var minAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (typeof attrVal === 'number') {
                    if (attrVal < res) { res = attrVal; }
                }
                return res;
            },
            Number.MAX_VALUE
        ];
    };

    var maxAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (typeof attrVal === 'number') {
                    if (attrVal > res) { res = attrVal; }
                }
                return res;
            },
            -Number.MAX_VALUE
        ];
    };

    var sumAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (typeof attrVal === 'number') {
                    res += attrVal;
                }
                return res;
            },
            0
        ];
    };

    var avgAttr = function(attrName) {
        return [
            function(res, el) {
                var attrVal = el[attrName];
                if (typeof attrVal === 'number') {
                    res[0] += attrVal;
                    ++res[1];
                }
                return res;
            },
            [0, 0],
            function(res) {
                if (res[1] === 0) { return 0; }
                return res[0] / res[1];
            }
        ];
    };



    // REUSABLE REDUCE

    var reduce = function(arr, algorithm) {
        var arr2 = arr.reduce(algorithm[0], algorithm[1]);
        if (algorithm[2]) {
            arr2 = algorithm[2](arr2);
        }
        return arr2;
    };


    /******************
     * REPL
     ******************/

    //var lastOnes = [];
    var lastSearch;
    var lastReduce;
    //var maxHistory = 5;
    var storeSearch = function(res) {
        lastSearch = res;
        //if (lastOnes.length >= maxHistory) { lastOnes.pop(); }
        //lastOnes.unshift(res);
    };


    var rl = readline.createInterface({
        input:  process.stdin,
        output: process.stdout,
        completer: function(line) {
            var p = line.split(' ');
            var pl = p.length;
            var l;
            var in2nd = false;

            if (p[0] ==='reduce') {
                in2nd = true;
                l = 'uniqueAttributes count unique top min max sum avg';
            }
            else if (pl === 0 || pl === 1) {
                l = 'add put get del list search count keys values clear now save reduce';
            }

            if (l) {
                l = l.split(' ');
                l.sort();
                var arg = p[ in2nd ? 1 : 0 ] || '';
                var hits = l.filter(function(w) { return w.indexOf(arg) === 0; });
                return [hits.length ? hits: l, arg];
            }
            return [[], ''];
        }
    });

    rl.on('line', function(cmd) {
        /*jshint maxcomplexity: 20 */

        cmd = cmd.split(' ');
        var op = cmd.shift();
        var key;

        switch (op) {
            case 'add':
                key = db.put( JSON.parse( cmd.join(' ') ), function(err) {
                    if (err) { return console.log(err.message+'\n'); }
                    console.log('data added to key ' + key + '\n');
                });
                break;

            case 'put':
                key = cmd.shift();
                db.put( JSON.parse( cmd.join(' ') ), function(err) {
                    if (err) { return console.log(err.message+'\n'); }
                    console.log('data set on key ' + key + '\n');
                });
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
                        res.forEach(function(v) {
                            //r = r.concat('* ', kv.key, ' -> ', JSON.stringify(kv.value, null, '\t'), '\n');
                            r = r.concat(JSON.stringify(v, null, '\t'), '\n');
                        });
                        storeSearch(res);
                        r = r.concat('TOTAL: ', res.length, '\n');
                        console.log(r.join(''));
                    });
                })();
                break;

            case 'count':
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

                    db.count(fn, function(err, res) {
                        if (err) { return console.log(err.message+'\n'); }
                        console.log(res + '\n');
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

            case 'now':
                console.log( now( cmd.join(' ') ) );
                break;

            case 'save':
                var name = cmd.shift() + '.json';
                var fromReduce = cmd.length > 0;
                fs.writeFileSync( name, JSON.stringify(fromReduce ? lastReduce : lastSearch, null, '\t') );
                console.log('last ' + (fromReduce?'reduce':'search') + ' saved to ' + name + '\n');
                break;

            case 'reduce':
                (function() {
                    if (!lastSearch) {
                        console.log('no prior answer. do a search/list first!');
                        return;
                    }
                    var b, a = lastSearch;
                    var reduceOp = cmd.shift();
                    var attr     = cmd.shift();
                    var p1       = cmd.shift();
                    var p2       = cmd.shift();
                    switch (reduceOp) {
                        case 'uniqueAttributes': b = reduce(a, uniqueAttrs()); break;

                        case 'count':  b = reduce(a,  countAttr(attr)); break;
                        case 'unique': b = reduce(a, uniqueAttr(attr)); break;
                        case 'top':
                            p1 = isTrue(p1);
                            p2 = (p2 !== undefined) ? parseInt(p2, 10) : undefined;
                            console.log(p1, p2);
                            b = reduce(a, topAttr(attr, p1, p2)); break;

                        case 'min': b = reduce(a, minAttr(attr)); break;
                        case 'max': b = reduce(a, maxAttr(attr)); break;
                        case 'sum': b = reduce(a, sumAttr(attr)); break;
                        case 'avg': b = reduce(a, avgAttr(attr)); break;
                        default:
                            console.log([
                                'for attributes:',
                                '  uniqueAttributes',
                                'for any attribute:',
                                '  count  <attrName>',
                                '  unique <attrName>',
                                '  top    <attrName> [<ascending?>] [<n results>]',
                                'for numeric attributes:',
                                '  min <attrName>',
                                '  max <attrName>',
                                '  sum <attrName>',
                                '  avg <attrName>'
                            ].join('\n'));
                            break;
                    }
                    console.log(JSON.stringify(b, null, '\t') + '\n');
                    lastReduce = b;
                })();
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
                    '* count <function body, receiving arguments v, k and returning boolean>\n',
                    '* clear\n',
                    '* keys\n',
                    '* values\n',
                    '* now <timeexpr>\n',
                    '* save <file name> [<fromReduce?>]\n',
                    '* reduce <op> <attrName> [params]\n\n'
                ].join(''));
        }
    });

};


module.exports = level1_cli;
