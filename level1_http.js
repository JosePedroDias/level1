(function() {
    
    'use strict';


    
    var express = require('express');
    var level1 = require('./index');


    
    var CFG = {
        port:            3000,
        dbPath:          './mydb',
        verbose:         false
    };



    var parseIfPossible = function(val) {
        try {
            val = JSON.parse(val);
        } catch (ex) {}
        return val;
    };



    var t = function(e, o, keyToSetIfString) {
        console.log('e:', typeof e, e, ' | o:', typeof o, o);
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



    var level1_http = function(cfg) {

        if (!cfg) { cfg = {}; }

        if ('port'            in cfg) { CFG.port            = cfg.port; }
        if ('dbPath'             in cfg) { CFG.dbPath             = cfg.dbPath; }
        //if ('accessControlFn' in cfg) { CFG.accessControlFn = cfg.accessControlFn; }
        if ('verbose'         in cfg) { CFG.verbose         = cfg.verbose; }

        var db = level1(cfg.dbPath);

        var app = express();

        app.use( express.bodyParser() );



        // CORS
        
        app.all('*', function(req, res, next) {
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

        app.post('/search', function(req, res) {
            
            var fn, fnBody;
            fnBody = req.body.filter || req.query.filter;

            if (CFG.verbose) { console.log('.search(' + fnBody + ')'); } 

            if (fnBody.indexOf('return') === -1) {
                fnBody = 'return ' + fnBody;
            }

            try {
                fn = new Function('v', 'k', fnBody);
            } catch (err) {
                return res.send({error: err});
            }

            db.search(fn, function(err, arrOfKV) {
                res.send( t(err, arrOfKV) );
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



        // SETS

        app.get('/del/:key', function(req, res) {
            var key = req.params.key;

            if (CFG.verbose) { console.log('.del(' + key + ')'); }
            
            db.del(key, function(err) {
                res.send( t(err, {ok:'ok'}) );
            });
        });
        
        app.post('/put/:key', function(req, res) {
            var key = req.params.key;
            var val = parseIfPossible( req.body.item || req.query.item );

            if (CFG.verbose) { console.log('.put(' + JSON.stringify(val) + ', ' + key + ')'); }
            
            db.put(val, key, function(err, value) {
                res.send( t(err, value, 'key') );
            });
        });

        app.post('/put', function(req, res) {
            var val = parseIfPossible( req.body.item || req.query.item );

            if (CFG.verbose) { console.log('.put(' + JSON.stringify(val) + ')'); }
            
            db.put( val, function(err, key) {
                res.send( t(err, key, 'key') );
            });
        });

        app.get('/clear', function(req, res) {
            if (CFG.verbose) { console.log('.clear()'); }
            
            db.clear(function(err, value) {
                res.send( t(err, value) );
            });
        });



        app.listen( CFG.port );
        console.log('serving http level1 server from port ' + CFG.port + '...');
    };



    module.exports = level1_http;
    
})();