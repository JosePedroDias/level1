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



    var level1_http = function(cfg) {

        if (!cfg) { cfg = {}; }

        if ('port'            in cfg) { CFG.port            = cfg.port; }
        if ('dbPath'             in cfg) { CFG.dbPath             = cfg.dbPath; }
        //if ('accessControlFn' in cfg) { CFG.accessControlFn = cfg.accessControlFn; }
        if ('verbose'         in cfg) { CFG.verbose         = cfg.verbose; }

        var db = level1(cfg.dbPath);

        var app = express();

        //app.use( express.bodyParser() );



        // CORS
        
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            next();
        });



        // OPTIONS

        app.options('*', function(req, res/*, next*/) {
            res.send('');
        });



        // GETS
        
        app.get('/get/:key', function(req, res) {
            var key = req.params.key;

            if (CFG.verbose) { console.log('.get(' + key + ')'); }
            
            db.get(key, function(err, value) {
                res.send(value); // TODO
            });
        });

        app.get('/list', function(req, res) {
            if (CFG.verbose) { console.log('.list()'); }
            
            db.list(function(err, arrOfKV) {
                res.send(arrOfKV); // TODO
            });
        });

        app.post('/search', function(req, res) {
            if (CFG.verbose) { console.log('.search()'); } 
            
            var fn, fnBody = 'return true;'; // TODO fnBody

            if (fnBody.indexOf('return') === -1) {
              fnBody = 'return ' + fnBody;
            }

            try {
              fn = new Function('v', 'k', fnBody);
            } catch (err) {
              return console.log({error: err});
            }

            db.search(fn, function(err, arrOfKV) {
                res.send(arrOfKV); // TODO
            });
        });

        app.get('/keys', function(req, res) {
            if (CFG.verbose) { console.log('.keys()'); }
            
            db.keys(function(err, keys) {
                res.send(keys); // TODO
            });
        });

        app.get('/values', function(req, res) {
            if (CFG.verbose) { console.log('.values()'); }
            
            db.values(function(err, values) {
                res.send(values); // TODO
            });
        });



        // SETS
        // put clear del
        // 
        app.get('/del/:key', function(req, res) {
            var key = req.params.key;

            if (CFG.verbose) { console.log('.del(' + key + ')'); }
            
            db.del(key, function(err, value) {
                res.send(value); // TODO
            });
        });
        
        app.post('/put/:key', function(req, res) {
            var key = req.params.key;

            console.log(typeof val);
            var val = parseIfPossible( req.body );

            if (CFG.verbose) { console.log('.put(' + val + ', ' + key + ')'); }
            
            db.put(val, key, function(err, value) {
                res.send(value); // TODO
            });
        });

        app.post('/put', function(req, res) {
            var val = parseIfPossible( req.body );

            if (CFG.verbose) { console.log('.put(' + val + ')'); }
            
            db.put(val, function(err, key) {
                res.send(key); // TODO
            });
        });

        app.get('/clear', function(req, res) {
            if (CFG.verbose) { console.log('.clear()'); }
            
            db.clear(function(err, value) {
                res.send(value); // TODO
            });
        });



        app.listen( CFG.port );
        console.log('serving http level1 server from port ' + CFG.port + '...');
    };



    module.exports = level1_http;
    
})();