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

                search: function(fnBody, cb) {
                    ajax(
                        [uri, 'search'].join('/'),
                        {
                            method: 'POST',
                            parameters: {filter:fnBody}
                        },
                        cb
                    );
                }
            };
        }

    };
    
})();
