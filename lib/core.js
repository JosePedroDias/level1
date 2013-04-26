'use strict';

var levelup = require('levelup'),
    uuid    = require('node-uuid'),
    async   = require('async');



/**
 * @function core
 * @param  {Object}    cfg
 * @param  {String}    cfg.dbPath                   path to the leveldb database
 * @param  {Boolean}   [cfg.attachTimestamps=true]  if true, added _createdAt and _modifiedAt
 * @param  {Boolean}   [cfg.attachKey=true]         if true, keyAttribute is attached to the value object for convenience
 * @param  {String}    [cfg.keyAttribute='_key']    key name to use if storing key in the value object
 * @param  {Function}  [cfg.interceptor]            if defined, put operations invoke this function passing value and key as arguments. if falsy is returned, the put is ignored. expects a return of [value, key].
 * @returns {Object}  core public API
 */
var level1_core = function(cfg) {

    if (!cfg) {
        cfg = {};
    }

    if (!('dbPath'           in cfg)) { throw new TypeError('level1.core() requires the dbPath option!'); }
    if (!('attachTimestamps' in cfg)) { cfg.attachTimestamps = true; }
    if (!('attachKey'        in cfg)) { cfg.attachKey        = true; }
    if (!('keyAttribute'     in cfg)) { cfg.keyAttribute     = '_key'; }



    // these are kept in closure scope
    
    var db = levelup(cfg.dbPath, {
        valueEncoding: 'json'
    });


    var now = function() {
        return new Date().valueOf();
    };



    // these will get exported

    /**
     * @function put
     * @param  {Object}    val    value to store
     * @param  {String}    [key]  where to store it
     * @param  {Function}  cb     with err
     * @async
     * @returns {String}  assigned key, both synchronously and asynchronously
     */
    var put = function(val, key, cb) {
        if (arguments.length === 2 && typeof key === 'function') {
            cb = key;
            key = undefined;
        }

        if (typeof val !== 'object') {
            return cb('value must be an object!');
        }

        if (cfg.attachKey) {
            if (key === undefined) {
                if (cfg.keyAttribute in val) {
                    key = val[ cfg.keyAttribute ];
                }
                else {
                    key = uuid.v1();
                    val[ cfg.keyAttribute ] = key;
                }
            }
            else if (key !== val[ cfg.keyAttribute ]) {
                val[ cfg.keyAttribute ] = key;
            }
        }
        else {
            key = uuid.v1();
        }

        if (cfg.attachTimestamps) {
            var ts = now();
            val._modifiedAt = ts;
            if (!('_createdAt' in val)) {
                val._createdAt = ts;
            }    
        }

        if (cfg.attachKey) {
            val[ cfg.keyAttribute ] = key;
        }

        if (cfg.interceptor) {
            var pair = cfg.interceptor(val, key);
            if (!pair) { return cb(null, 'IGNORED'); }
            val = pair[0];
            key = pair[1];
        }

        db.put(key, val, function(err) {
            if (err) { return cb(err); }
            cb(null, key);
        });

        return key;
    };



    /**
     * @function get
     * @param  {String}    key  key to look for
     * @param  {Function}  cb   with err and result item
     * @async
     * @returns {Object}  value object retrieved
     */
    var get = function(key, cb) {
        db.get(key, function(err, val) {
            if (err) { return cb(err); }

            cb(null, val);
        });
    };



    /**
     * @function values
     * @param  {Function}  cb  with err and keys array
     * @async
     * @returns {Array}  array of keys
     */
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



    /**
     * @function values
     * @param  {Function}  cb  with err and values array
     * @async
     * @returns {Array}  array of values
     */
    var values = function(cb) {
        var res = [];
        var rs = db.createReadStream();

        rs.on('data', function(kv) {
            res.push( kv.value );
        });

        rs.on('error', function(err) {
            cb(err);
        });

        rs.on('end', function() {
            cb(null, res);
        });
    };



    /**
     * @function search
     * @param  {Function}  filterFn  arguments are v and k, should return boolean
     * @param  {Function}  cb        with err and result array
     * @async
     * @returns {Array}  array of filtered values
     */
    var search = function(filterFn, cb) {
        var res = [];
        var rs = db.createReadStream();

        rs.on('data', function(kv) {
            var v = kv.value;
            var result;
            try {
                result = filterFn(v, kv.key);
                if (result) {
                    res.push( cfg.attachKey ? v : {key:kv.key, value:kv.value} );
                }
            } catch (ex) {} // TODO KINDA LAME?!
        });

        rs.on('error', function(err) {
            cb(err);
        });

        rs.on('end', function() {
            cb(null, res);
        });
    };



    /**
     * @function list
     * @param  {Function}  cb  with err and result array
     * @async
     * @returns {Array}  array of values
     */
    var list = function(cb) {
        search(function() {return true;}, cb);
    };



    /**
     * @function count
     * @param  {Function}  filterFn  arguments are v and k, should return boolean
     * @param  {Function}  cb        with err and result array
     * @async
     * @returns {Number}  number of values found
     */
    var count = function(filterFn, cb) {
        var res = 0;
        var rs = db.createReadStream();

        rs.on('data', function(kv) {
            var result;
            try {
                result = filterFn(kv.value, kv.key);
                if (result) {
                    ++res;
                }
            } catch (ex) {} // TODO KINDA LAME?!
        });

        rs.on('error', function(err) {
            cb(err);
        });

        rs.on('end', function() {
            cb(null, res);
        });
    };



    /**
     * @function del
     * @param  {String}    key
     * @param  {Function}  cb
     * @async
     */
    var del = function(key, cb) {
        return db.del(key, cb);
    };



    /**
     * @function clear
     * @param  {Function}  cb
     * @async
     */
    var clear = function(cb) {
        keys(function(err, keys) {
            if (err) { return cb(err); }
            async.forEachSeries(
                keys,
                function(key, innerCb) {
                    db.del(key, innerCb);
                },
                function(err) {
                    cb(err);
                }
            );
            /*keys.forEach(function(key) {  // TODO INCORRECT...
                db.del(key);
            });
            cb(null);*/
        });
    };



    /**
     * @function uuids
     * @param  {Number}  [n=1]  number of uuids to generate
     * @return {String*}
     */
    var uuids = function(n) {
        if (n === undefined) { n = 1; }
        if (typeof n !== 'number') { throw new TypeError('n must be an integer number.'); }
        var r = new Array(n);
        for (var i = 0; i < n; ++i) {
            r[i] = uuid.v1();
        }
        return r;
    };


    // public API
    
    return {
        put:     put,
        get:     get,
        del:     del,
        keys:    keys,
        values:  values,
        search:  search,
        count:   count,
        list:    list,
        clear:   clear,
        uuids:   uuids,
        on:      db.on.bind(db),
        _db:     db
    };
};



module.exports = level1_core;
