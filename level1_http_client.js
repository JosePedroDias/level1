(function() {

    'use strict';

    /*jshint node:false, browser:true */
    /*global XDomainRequest:false */
    


    /**
     * CORS ajax implementation
     * 
     * @function ajax
     * @param  {String}    uri                   server URI
     * @param  {Object}    [options]             options
     * @param  {String}    [options.method]      either 'GET' or 'POST'. 'GET' is default.
     * @param  {Object}    [options.parameters]  optional set of parameters to send
     * @param  {Object}    [options.headers]     optional headers to set
     * @param  {Function}  cb                    callback function. receives error and result
     */
    var ajax = function(uri, options, cb) {

        // arguments parsing
        var al = arguments.length;
        if (al === 3) {}
        else if (al === 2) {
            cb = options;
            options = {};
        }
        else {
            throw new TypeError('ajax expects arguments: ({String}uri, [{Object}options], {Function}cb');
        }

        if (!('method'     in options)) { options.method     = 'GET'; }
        if (!('parameters' in options)) { options.parameters = {};    }
        if (!('headers'    in options)) { options.headers    = {};    }

        // set parameters
        var hasQM = uri.lastIndexOf('?') !== -1;
        var k, v, p = [];
        for (k in options.parameters) {
            v = options.parameters[k];
            p.push( [k, encodeURIComponent(v)].join('=') );
        }
        p = p.join('&');
        uri = [uri, p].join(hasQM ? '&' : '?');

        // create comm object
        var xhr = new XMLHttpRequest();
        if ('withCredentials' in xhr) { // chrome/safari/ff/opera
            xhr.open(options.method, uri, true);
        }
        else if (XDomainRequest) { // ie 8+
            xhr = new XDomainRequest();
            xhr.open(options.method, uri);
        }
        else {
            return cb('unsupported browser');
        }

        // set headers
        for (k in options.headers) {
            v = options.headers[k];
            xhr.setRequestHeader(k, v);   
        }

        // setup callback to handle result
        var cbInner = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                return cb(null, JSON.parse(xhr.response));
            }
            cb('error requesting ' + uri);
        };
        xhr.onload  = cbInner;
        xhr.onerror = cbInner;

        // fire request
        xhr.send(null);
    };

    

    var js = function(o) {
        if (typeof o === 'object') {
            return JSON.stringify(o);
        }
        return o;
    };


    var fnr = /function\s*\((.*)\)\s*{(.*)}/g;
    //console.log( fnr.exec('function (v, k) { return v.age > 1; }') );
    var parseFn = function(fn) {
        var m = fnr.exec( fn.toString() );
        var args = m[1].split(/\s*,\s*/);
        var body = m[2].trim();
        fnr.lastIndex = 0;
        return {args:args, body:body};
    };



    var extractAndValidateFilterFn = function(fn) {
        if (typeof fn === 'string') {
            return fn;
        }
        else if (typeof fn !== 'function') {
            throw new TypeError('filter function must be a function or its body string!');
        }
        var o = parseFn(fn);
        var a0 = o.args[0];
        if (a0 && a0 !== 'v') { throw new Error('first argument must be named v!'); }
        var a1 = o.args[1];
        if (a1 && a1 !== 'k') { throw new Error('secound argument must be named k!'); }
        return o.body;
    };
    //console.log( parseFn('function (v, k) { return v.age > 1; }') );
    //console.log( extractAndValidateFilterFn(function (v, k) { return v.age > 1; }) );



    var noop = function() {};



    window.level1 = {

        open: function(uri) {
            return {
                list: function(cb) {
                    ajax(
                        [uri, 'list'].join('/'),
                        cb
                    );
                },

                keys: function(cb) {
                    ajax(
                        [uri, 'keys'].join('/'),
                        cb
                    );
                },

                values: function(cb) {
                    ajax(
                        [uri, 'values'].join('/'),
                        cb
                    );
                },

                uuids: function(n, cb) {
                    if (typeof n === 'function') {
                        cb = n;
                        n = 1;
                    }
                    ajax(
                        [uri, 'uuids', n].join('/'),
                        cb
                    );
                },

                clear: function(cb) {
                    ajax(
                        [uri, 'clear'].join('/'),
                        cb ? cb : noop
                    );
                },

                get: function(key, cb) {
                    ajax(
                        [uri, 'get', key].join('/'),
                        cb
                    );
                },

                put: function(val, key, cb) {
                    if (typeof key === 'function') {
                        cb = key;
                        key = undefined;
                    }
                    var urii = [uri, 'put'];
                    if (key !== undefined) {
                        urii.push(key);
                    }
                    ajax(
                        urii.join('/'),
                        {
                            method: 'POST',
                            parameters: {item:js(val)}
                        },
                        cb ? cb : noop
                    );
                },

                del: function(key, cb) {
                    ajax(
                        [uri, 'del', key].join('/'),
                        cb ? cb : noop
                    );
                },

                search: function(filterFn, cb) {
                    if (arguments.length === 1) {
                        cb = filterFn;
                        filterFn = 'return true';
                    }
                    filterFn = extractAndValidateFilterFn(filterFn);
                    ajax(
                        [uri, 'search'].join('/'),
                        {
                            method: 'POST',
                            parameters: {filter:filterFn}
                        },
                        cb
                    );
                },

                count: function(filterFn, cb) {
                    if (arguments.length === 1) {
                        cb = filterFn;
                        filterFn = 'return true';
                    }
                    filterFn = extractAndValidateFilterFn(filterFn);
                    ajax(
                        [uri, 'count'].join('/'),
                        {
                            method: 'POST',
                            parameters: {filter:filterFn}
                        },
                        cb
                    );
                }
            };
        }

    };
    
})();
