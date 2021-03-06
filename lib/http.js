(function() {

    'use strict';



    var express     = require('express'),
        level1_core = require('./core');



    var CFG = {
        port:            3000,
        dbPath:          './mydb',
        verbose:         false
    };



    var t = function(e, o, keyToSetIfString) {
        if (!e) {
            if (typeof o !== 'object') {
                var O = {ok:'ok'};
                if (keyToSetIfString) {
                    O[keyToSetIfString] = o;
                }
                return O;
            }
            return o;
        }
        if (typeof e !== 'object') {
            return {error:e.message || e};
        }
        return {error:e.message || e};
    };



    var noop = function() {};



    var runningSince = new Date();
    var requests = 0;




    var level1_http = function(cfg) {

        if (!cfg) { cfg = {}; }

        if ('port'            in cfg) { CFG.port            = cfg.port; }
        if ('dbPath'             in cfg) { CFG.dbPath             = cfg.dbPath; }
        //if ('accessControlFn' in cfg) { CFG.accessControlFn = cfg.accessControlFn; }
        if ('verbose'         in cfg) { CFG.verbose         = cfg.verbose; }

        var db = cfg.db || level1_core({dbPath:cfg.dbPath});

        var app = express();

        //app.use( express.logger('tiny') );
        app.use( express.favicon(__dirname + '/static/favicon.ico') );
        app.use( express.compress() );
        app.use( express.bodyParser() );



        // CORS

        app.all('*', function(req, res, next) {
            ++requests;
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            next();
        });



        // OPTIONS

        app.options('*', function(req, res) {
            res.send('');
        });



        // GETS

        app.get('/get/:key', function(req, res) {
            var key = req.params.key;

            if (CFG.verbose) { console.log('.get(' + key + ')'); }

            db.get(key, function(err, value) {
                res.send( t(err, value) );
            });
        });

        app.get('/list', function(req, res) {
            if (CFG.verbose) { console.log('.list()'); }

            db.list(function(err, arrOfKV) {
                res.send( t(err, arrOfKV) );
            });
        });

        var searchHdlr = function(req, res) {
            var fn, fnBody;
            fnBody = req.body.filter || req.query.filter;
            if (!fnBody) {
                fnBody = 'return true';
            }

            if (fnBody.indexOf('return') === -1) {
                fnBody = 'return ' + fnBody;
            }

            if (CFG.verbose) { console.log('.search(' + fnBody + ')'); }

            try {
                fn = new Function('v', 'k', fnBody);
            } catch (err) {
                return res.send({error: err});
            }

            db.search(fn, function(err, arrOfKV) {
                res.send( t(err, arrOfKV) );
            });
        };
        app.get('/search', searchHdlr);
        app.post('/search', searchHdlr);

        app.post('/count', function(req, res) {
            var fn, fnBody;
            fnBody = req.body.filter || req.query.filter;
            if (!fnBody) {
                fnBody = 'return true';
            }

            if (fnBody.indexOf('return') === -1) {
                fnBody = 'return ' + fnBody;
            }

            if (CFG.verbose) { console.log('.count(' + fnBody + ')'); } 

            try {
                fn = new Function('v', 'k', fnBody);
            } catch (err) {
                return res.send({error: err});
            }

            db.count(fn, function(err, n) {
                res.send( t(err, n, 'count') );
            });
        });

        app.get('/keys', function(req, res) {
            if (CFG.verbose) { console.log('.keys()'); }

            db.keys(function(err, keys) {
                res.send( t(err, keys) );
            });
        });

        app.get('/values', function(req, res) {
            if (CFG.verbose) { console.log('.values()'); }

            db.values(function(err, values) {
                res.send( t(err, values) );
            });
        });

        app.get('/uuids/:n', function(req, res) {
            var n = req.params.n;

            if (CFG.verbose) { console.log('.n(' + n + ')'); }

            n = parseInt(n, 10);

            if (isNaN(n)) {
                return res.send({error:'argument must be an integer number'});
            }

            res.send( db.uuids(n) );
        });



        // SETS

        app.get('/del/:key', function(req, res) {
            var key = req.params.key;

            if (CFG.verbose) { console.log('.del(' + key + ')'); }

            db.del(key, function(err) {
                res.send( t(err, {ok:'ok'}) );
            });
        });

        var putKeyHdlr = function(req, res) {
            var key = req.params.key;
            var val = req.body.item || req.query.item;

            val = JSON.parse(val);

            if (CFG.verbose) { console.log('.put(' + JSON.stringify(val) + ', ' + key + ')'); }

            db.put(val, key, function(err, value) {
                res.send( t(err, value, 'key') );
            });
        };
        app.get('/put/:key', putKeyHdlr);
        app.post('/put/:key', putKeyHdlr);

        var putHdlr = function(req, res) {
            var val = req.body.item || req.query.item;
            
            val = JSON.parse(val);

            if (CFG.verbose) { console.log('.put(' + JSON.stringify(val) + ')'); }

            db.put( val, function(err, key) {
                res.send( t(err, key, 'key') );
            });
        };
        app.get('/put', putHdlr);
        app.post('/put', putHdlr);

        // removed 'data:image/png;base64,' prefix from 1x1 canvas to base64
        var imgB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=';
        var imgBin = new Buffer(imgB64, 'base64');
        var imgLen = imgBin.length;

        var putImgHdlr = function(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.header('Content-Type', 'image/png');
            res.header('Content-Length', imgLen);

            var val = req.query;

            if (CFG.verbose) { console.log('.put_img(' + JSON.stringify(val) + ')'); }

            db.put(val, noop);

            res.writeHead(200);
            res.end(imgBin, 'binary');
        };
        app.get('/put_img', putImgHdlr);

        app.get('/clear', function(req, res) {
            if (CFG.verbose) { console.log('.clear()'); }

            db.clear(function(err, value) {
                res.send( t(err, value) );
            });
        });

        app.get('/', function(req, res) {
            res.send({
                runningSince: runningSince,
                uptime:       Math.round( ( new Date().valueOf() - runningSince.valueOf() ) / 1000 ),
                requests:     requests
            });
        });



        // TODO expose these optionally
        /*db.on('ready', function() { console.log('* READY'); });
        db.on('closed', function() { console.log('* CLOSED'); });
        db.on('put', function(k, v) { console.log('* PUT: ', k, '->', v); });
        db.on('del', function(k) { console.log('* DEL: ', k); });*/
        


        app.listen( CFG.port );
        console.log('serving http level1 server from port ' + CFG.port + ' for db ' + (cfg.dbPath ? cfg.dbPath : 'direct instance') + '...');



        return db;
    };



    module.exports = level1_http;

})();
