'use strict';

var levelup = require('levelup'),
    uuid    = require('node-uuid');




var level1_core = function(cfg) {

    if (!cfg) {
        cfg = {};
    }

    if (!('dbPath' in cfg)) { throw new TypeError('level1.core() requires the dbPath option!'); }



    // these are kept in closure scope
  
    var db = levelup(cfg.dbPath);



    var now = function() {
        return new Date().valueOf();
    };



    var parseIfPossible = function(val) {
        try {
            val = JSON.parse(val);
        } catch (ex) {}
        return val;
    };



    // these will get exported

    var put = function(val, key, cb) {
        if (arguments.length === 2 && typeof key === 'function') {
            cb = key;
            key = undefined;
        }

        if (key === undefined) {
            key = uuid.v1();
        }

        if (typeof val === 'object') {
            var ts = now();
            val._modifiedAt = ts;
            if (!('_createdAt' in val)) {
                val._createdAt = ts;
            }

            val = JSON.stringify(val);
        }

        if (!cb) {
            cb = function(err) {
            if (err) {
                console.log('ERR:' + err.message); }
            };
        }

        db.put(key, val, function(err) {
            if (err) { return cb(err); }
            cb(null, key);
        });

        return key;
    };



    var get = function(key, cb) {
        db.get(key, function(err, val) {
            if (err) { return cb(err); }

            val = parseIfPossible(val);

            cb(null, val);
        });
    };



    var keys = function(cb) {
        var ks = db.createKeyStream();
        var keys = [];

        ks.on('data', function(k) {
            keys.push(k);
        });

        ks.on('error', function(err) {
            //ks.close();
            cb(err);
        });

        ks.on('end', function() {
            //ks.close();
            cb(null, keys);
        });
    };



    var values = function(cb) {
        var res = [];
        var rs = db.createReadStream();

        rs.on('data', function(kv) {
            res.push( parseIfPossible(kv.value) );
        });

        rs.on('error', function(err) {
            //rs.close();
            cb(err);
        });

        rs.on('end', function() {
            //rs.close();
            cb(null, res);
        });
    };



    var search = function(filterFn, cb) {
        var res = [];
        var rs = db.createReadStream();

        rs.on('data', function(kv) {
            var v = parseIfPossible(kv.value);
            var result = filterFn(v, kv.key);
            if (result) {
                res.push({key:kv.key, value:v});
            }
        });

        rs.on('error', function(err) {
            //rs.close();
            cb(err);
        });

        rs.on('end', function() {
            //rs.close();
            cb(null, res);
        });
    };



    var clear = function(cb) {
        keys(function(err, keys) {
            if (err) { return cb(err); }
            keys.forEach(function(key) {  // TODO INCORRECT...
                db.del(key);
            });
            cb(null);
        });
    };


    return {
        put:     put,
        get:     get,
        del:     function(key, cb) { return db.del(key, cb); },
        keys:    keys,
        values:  values,
        search:  search,
        list:    function(cb) { search(function() {return true;}, cb); },
        clear:   clear
    };
};



module.exports = level1_core;
