/**
 * ----------------------------- EZStorage -------------------------------------
 * Simple HTML5 Storage wrapper to save data on the browser side
 * Defaults to cookies (if enabled) if HTML Storage is not supported.
 *
 * Version: 1.2.2
 *
 * Licensed under MIT-style license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2013 Wayne Weibel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function ($) {

$('document').ready(function () {
    var JSON = {
        parse:
            window.JSON && (window.JSON.parse || window.JSON.decode) ||
            String.prototype.evalJSON && function(str){return String(str).evalJSON();} ||
            $.parseJSON ||
            $.evalJSON,
        stringify:
            Object.toJSON ||
            window.JSON && (window.JSON.stringify || window.JSON.encode) ||
            $.toJSON
    };
    
    // ensure that JSON.parse and JSON.strinigify are available
    if(!('parse' in JSON) || !('stringify' in JSON)){
        $.getScript('http://cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js', function() {
            console.log('EZStorage: loaded JSON library dynamically');
        });
    }

    // include jquery.cookie ($.cookie) library
    if ( typeof(jQuery.cookie) === 'undefined' ) {
        $.getScript('https://raw.github.com/carhartl/jquery-cookie/master/jquery.cookie.js', function() {
            console.log('EZStorage: loaded jQuery.cookie library dynamically');
        });
    }
});

/**
 * overloaded function to manage 'storage'
 * - checks if local/session Storage is implemented in the browser
 * - checks if cookies are enabled
 * - get/set key:value pairs (in Storage or as a cookie)
 * - removes key:value pairs (in Storage or as a cookie)
 *
 * @param action  : the action to perform
 *      - 'enabled' = verify that a storage option is possible
 *      - 'get' = get a value from storage; returns null, Scalar, Object
 *      - 'set' = set a key:value pair; value converted to JSON String if Object
 *      - 'remove' = delete a key:value pair
 *
 * @param key     : the key to store; String; n/a with enabled
 * @param value   : the value to store; any type; n/a with get or remove
 * @param options : options for setting the key:value; Optional - n/a with enabled
 *            - {
 *                  expires: Date object (preferred), Numeric number of days, or parseable date String
 *                  persist: Boolean; whether to place value in localStorage despite expires being set
 *                  path: String; only used if cookie,
 *                  full: Boolean; whether to return the full object stored by ezstorage or just value
 *              }
 *            - if using HTMLStorage 'value' converted to an Object; value.expires = expireDate, etc.
 *            - during 'get', check is made for expired; null returned if expired
 *            - if expires omitted, sessionStorage used
 *
 * @return
 * - 'enabled'   = Boolean
 * - 'get'       = null or stored value; will be Object if Scalar set with an expires
 * - 'set'       = stored value as a String
 * - 'remove'    = always true, unless an error occured
 */
    var ezs = $.ezstorage =
    function EZStorage(action, key, value, options) {
    
        // establish options - set expires to date object if necessary
        options = $.extend({}, ezs.settings, options);
        if ( options.expires ) {
            if (options.expires instanceof Date) {/* do nothing */}
            else if (typeof options.expires === 'number') {
                options.expires = new Date(new Date().setTime(new Date().getTime() + ((options.expires*24)*60*60*1000)));
            }
            else {
                // some other value is placed in options.expires, attempt to make a Date object
                try { options.expires = new Date(options.expires); } catch(err) { delete options.expires; }
            }
        }

        switch ( action ) {
            case 'enabled':
                if ( typeof(Storage) !== "undefined" ) { return true; }
                else { //HTMLStorage (local or session) is not available
                    $.cookie('ezstorage_cookies_enabled', 'enabled', {path:'/'});
                    if ( $.cookie('ezstorage_cookies_enabled') ) {
                        $.removeCookie('ezstorage_cookies_enabled', {path:'/'});
                        return true;
                    }
                }

                return false; //storage and cookies not available
                break;

            case 'get':
                if ( typeof(Storage) !== "undefined" ) {
                    var item = localStorage.getItem(key);
                    if ( item ) {
                        try { item = JSON.parse(item); } catch(err) { return item; }
                        if ( !item.ezstorage ) { return item; }

                        if ( item.expires && new Date(item.expires) < new Date() ) {
                            localStorage.removeItem(key);
                            return null;
                        }

                        return (options.full) ? item : item.value;
                    }
                    else {
                        item = sessionStorage.getItem(key);
                        if ( item ) {
                            try { return JSON.parse(item); } catch(err) { return item; }
                        }
                    }
                }
                
                // check for a cookie version if not found in storage
                return $.cookie(key);
                break;

            case 'set':
                var v = JSON.stringify(value);
                if ( typeof(Storage) !== "undefined" ) {
                    if (options.expires || options.persist) {
                        v = JSON.stringify($.extend({}, {value:value}, options));
                        localStorage.setItem(key, v);
                    }
                    else { sessionStorage.setItem(key, v); }
                }
                else {
                    // an undefined 'expires' makes the cookie a session cookie
                    $.cookie(key, v, options)
                }

                return v;
                break;

            case 'remove':
                if ( typeof(Storage) !== "undefined" ) {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                }
                $.removeCookie(key, options);
                return true; // to validate the remove completed
                break;

            default:
                break;
        }

        return null;
    };

    // add in shorthand functions and default settings
    $.extend(ezs, {
        enabled : function() { return this('enabled'); },
        get : function (key, options) { return this('get', key, null, options); },
        set : function (key, value, options) { return this('set', key, value, options); },
        remove : function (key, options) { return this('remove', key, null, options); },
        defaultSettings : function() { this.settings = {ezstorage: true, path:'/'}; },
        settings : {ezstorage: true, path: '/'}
    });
    
})(jQuery);