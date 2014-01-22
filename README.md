jQuery EZStorage
==================

jQuery EZStorage is a plugin that simplifies access to HTML5 storages & cookies.  The plugin handles determining where and how to store and retrieve data; in HTML5 Storage if it is available, or defaults to cookies.

Functionalities:

- Store data easily, encode/decode it with JSON automatically.
- Automatcially handles conversion of Number and String to Date for expiration values.
- Attempts to dynamically load [jquery.cookie][1] and [JSON][2] libraries if necessary.  These should be included directly to avoid complications with browsers and data transfer.
[1]: https://raw.github.com/carhartl/jquery-cookie/master/jquery.cookie.js
[2]: http://cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js

<br />

Usage
-------------------------

    $.ezstorage(action, key, value, options)
    
 overloaded function to manage 'storage'
 
 - checks if local/session Storage is implemented in the browser
 - checks if cookies are enabled
 - get/set key:value pairs (in Storage or as a cookie)
 - removes key:value pairs (in Storage or as a cookie)
 
@param String __action__
 
   - the action to perform:
    - 'enabled' = verify that a storage option is possible
    - 'get' = get a value from storage; returns null, Scalar, Object
    - 'set' = set a key:value pair; value converted to JSON String if Object
    - 'remove' = delete a key:value pair

@param String __key__

   - the key to store; n/a with enabled

@param Mixed __value__

   - the value to store; n/a with get or remove

@param Object __options__

  - options for setting the key:value; Optional - n/a with enabled
  - if using HTMLStorage 'value' converted to an Object; value.expires = expireDate, etc.
  - during 'get', check is made for expired; null returned if expired
  - if expires omitted, sessionStorage used
  - Object:
	- expires: Date object (preferred), Numeric number of days, or parseable date String
    - persist: Boolean; whether to place value in localStorage despite expires being set
    - path: String; only used if cookie,
    - full: Boolean; whether to return the full object stored by ezstorage or just value
            
@return Mixed

  - 'enabled' = Boolean
  - 'get' = null or stored value; will be Object if Scalar set with an expires
  - 'set' = stored value; 
  - 'remove' = always True, if not a javascript error occured.
  
<br />    
Shorthand Functions
-------------------------
### `enabled()`
Check whether a storage method is available; HTML5 Storage or cookies

    $.ezstorage.enabled();

### `get(key, options = {})`
Get an item from a storage.  Searches localStorage, sessionStorage, and cookies.

    $.ezstorage.get('foo');
    $.ezstorage.get('foo', {full:true}); // return {ezstorage:true …} not just 'value'

### `set(key, value, options = {})`
Set an item in a storage. If options.expire or options.persist are set value is stored in localStorage, else sessionStorage/cookie.  
- __value__ is stored as an object: `{ezstorage:true, <options>, value:<value>}`


    $.ezstorage.set('foo', 'value');
    $.ezstorage.set('foo', 'value', {expires:3});
    $.ezstorage.set('foo', 'value', {persist:true});

### `remove(key, options = {})`
Delete an item from all storages (local, session, and cookie).  Options only used if being stored as a cookie.

    storage.remove('foo');
    
<br />
Global Object
-------------------------

     $.ezstorage.defaultSettings(); // return settings to {ezstorage: true, path:'/'};
     $.ezstorage.settings = {<your settings>}; // no longer need to pass in function
     
<br />
Compatibility
-------------

JQuery EZStroage is compatible with all browsers that support (and have enabled) storage/cookies.
