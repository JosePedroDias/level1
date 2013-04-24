(function() {

    'use strict';

    /*jshint node:false, browser:true */
    


    window.level1 = {

        open: function(uri) {
            return {
                put_img: function(val) {
                    try {
                        if (typeof val !== 'object') {
                            val = JSON.parse(val);
                        }
                    } catch (ex) {
                        return 'parsing error!';
                    }

                    var k, v, p = [];
                    for (k in val) {
                        v = val[k];
                        p.push( [k, encodeURIComponent(v)].join('=') );
                    }
                    p = p.join('&');
                    var urii = [uri, '/put_img?', p].join('');

                    var imgEl = new Image();
                    imgEl.src = urii;
                }
            };
        }

    };
    
})();
