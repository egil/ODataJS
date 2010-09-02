"use strict";

// uri builder
// request builder
// response handler 
// query options
(function (window, undefined) {
    var OData, Uri,

    // Used for trimming slashes from begining and end of string.
    rtrimSlashes = /^\/+|\/+$/g,

    /**
    * Trims slashes away from begining and end of string.
    * @param {string} str String to remove slashes from.
    * @return {string} Trimmed string.
    */
    trimSlashes = function (str) {
        return (str || "").replace(rtrimSlashes, '');
    },

    // Used for trimming slashes at the end of strings.
    rtrimSlashesEnd = /\/+$/g,

    /**
    * Trims slashes away from the end of the string.    
    * @param {string} str String to remove slashes from.
    * @return {string} Trimmed string.
    */
    trimEndSlashes = function (str) {
        return (str || '').replace(rtrimSlashesEnd, '');
    },

    // Used for trimming whitespace.
	rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,

    // use buildin String.trim function if one is available, 
    // otherwise use function lifted from jQuery 1.4.2.
    trim = typeof String.trim === 'function' ?
        String.trim :
        function (text) {
            return (text || '').replace(rtrim, '');
        };

    /**
    * The OData class
    * @constructor
    * @param {!string} uri The uri of the service to query against.
    * @param {?Object.<string, string>} options Custom options to use when querying against the service.
    */
    OData = function (uri, options) {
        this.uri = new Uri(uri);
        this.settings = options;
    };

    /**
    * An class for handling OData URIs.
    * @private
    * @constructor
    * @param {Object.<string, string>|string} input Uri root or uri segments including a root.
    */
    Uri = function (input) {
        this.segments = input;

        // assume input is uri root
        if (typeof input === 'string') {
            this.segments = {};
            this.segments.root = input;
        }

        // make sure we have a root element
        if (!this.segments.root) {
            throw { name: 'missing argument', message: 'root is not specified' };
        }
    };

    /**
    * Function that parses an uri string and returns a new Uri object
    * based on that string.
    *
    * @param {!string} uri The uri string to parse.
    * @return {OData} A new Uri object.
    */
    Uri.prototype.parse = function (uri) {
        var result,
            temp,
            resourcePath,
            queryString,
            index,
            root = this.segments.root,
            parts,
            opts,
            length;

        // Instanciate a new Uri object to put result in.
        result = new Uri(root);

        // divide uri into two portions, 
        //   parts[0] = the service root uri and resource path
        //   parts[1] = the query string options
        parts = uri.split('?');

        if (parts.length > 2) {
            throw { name: 'invalid input', message: 'uri is not valid, to many ? in the uri' };
        }

        queryString = parts[1];

        // find ressource path part of uri
        // NOTE: indexOf is case sensitive, thus toUpperCase
        temp = parts[0].toUpperCase();
        root = root.toUpperCase();

        // Location of resource path part in temp
        if (temp.indexOf(root) === 0) {
            // both root and uri are absolute or relative
            resourcePath = parts[0].slice(root.length);
        } else if ((index = temp.indexOf(root)) > 0) {
            // root is absolute, uri is relative (thus fits in uri)
            resourcePath = parts[0].slice(root.length + index);
        } else {
            // uri absolute, root is relative
            // remove one character from root at the time,
            // until we find the the start of temp.
            index = 0;
            do {
                root = root.slice(1);
                index += 1;
            } while (root.length > 0 && temp.indexOf(root) !== 0);

            resourcePath = parts[0].slice(root.length);
        }

        // resourcePath is now the entire resource path

        // look for $value option at the end of the 
        // resource path and strip it away if it exists
        parts = resourcePath.split('/$value');
        if (parts.length === 2) {
            result.segments.value = true;
        }
        resourcePath = parts[0];

        // look for $count option at the end of the 
        // resource path and strip it away if it exists
        parts = resourcePath.split('/$count');
        if (parts.length === 2) {
            result.segments.count = true;
        }
        resourcePath = parts[0];

        // look for $links only if $value was not
        // already found. $links and $value can not 
        // be used at the same time
        if (!result.segments.value && (parts = resourcePath.split('/$links/')).length === 2) {
            // we are done with resouce path part now
            result.segments.resource = trimSlashes(trim(parts[0]));
            result.segments.links = parts[1];
        } else {
            result.segments.resource = trimSlashes(trim(resourcePath));
        }

        // parse query string part of uri
        if (queryString !== undefined && queryString.length > 0) {

            // first split query string in different parts.
            parts = queryString.split('&');

            // cache length of parts array 
            length = parts.length;

            // create options object in segments
            if (length) {
                result.segments.options = {};
            }

            // cache options object for better optimization 
            opts = result.segments.options;

            // split individual parts on '=' and add to options object
            for (index = 0; index < length; index += 1) {
                temp = parts[index].split('=');
                switch (temp[0]) {
                    case '$orderby':
                        opts.orderby = temp[1];
                        break;
                    case '$top':
                        opts.top = parseInt(temp[1], 10);
                        break;
                    case '$skip':
                        opts.skip = parseInt(temp[1], 10);
                        break;
                    case '$filter':
                        opts.filter = temp[1];
                        break;
                    case '$expand':
                        opts.expand = temp[1];
                        break;
                    case '$select':
                        opts.select = temp[1];
                        break;
                    case '$skiptoken':
                        opts.skiptoken = temp[1];
                        break;
                    case '$inlinecount':
                        opts.inlinecount = temp[1] === 'allpages';
                        break;
                    case '$format':
                        opts.format = temp[1];
                        break;
                    default:
                        // catch custom parameters and service operation parameters
                        if (!opts.params) {
                            opts.params = {};
                        }
                        opts.params[temp[0]] = temp[1];
                        break;
                }
            }
        }

        return result;
    };

    /**    
    * Converts an uri object into a string for use when querying.
    * @return {string} An string representing the uri object.
    */
    Uri.prototype.stringify = function () {
        var opt,
            segs,
            key,
            needAmpersand = false,
            resourcePath,
            qopts = '';

        segs = this.segments;
        opt = segs.options;

        // if root is undefined, there is nothing to build.
        if (!segs.root) {
            return '';
        }

        // start out with just the resouce path, if that is defined.        
        resourcePath = segs.resource || '';

        // start of extended part of resource path

        // addressing links between entries
        if (segs.links) {
            resourcePath += '/$links/' + trimSlashes(segs.links);
        }

        // add count if specified or ...
        if (segs.count) {
            resourcePath += '/$count';
        }

        // add value if specified.
        else if (segs.value) {
            resourcePath += '/$value';
        }

        // end of extended part of resource path

        // add query string options
        for (key in opt) {
            if (key !== undefined && opt[key] !== null) {
                switch (key) {
                    case 'params':
                        for (key in opt.params) {
                            if (key !== undefined) {
                                if (needAmpersand) {
                                    qopts += '&';
                                }
                                qopts += key + "=" + opt.params[key];
                                needAmpersand = true;
                            }
                        }
                        break;
                    case 'inlinecount':
                        // inlinecount === none is the same as 
                        // not including inlinecount in query string.
                        if (opt.inlinecount) {
                            if (needAmpersand) {
                                qopts += '&';
                            }
                            qopts += "$inlinecount=allpages";
                            needAmpersand = true;
                            break;
                        }
                        break;
                    case 'format':
                        // specify $format=json in url if retriving json, i.e. not $count or $value.
                        if (opt[key] === 'json' && (segs.count || segs.value)) {
                            break;
                        }
                    case 'callback':
                    case 'orderby':
                    case 'top':
                    case 'skip':
                    case 'filter':
                    case 'expand':
                    case 'select':
                    case 'skiptoken':
                        if (needAmpersand) {
                            qopts += '&';
                        }
                        qopts += "$" + key + "=" + opt[key];
                        needAmpersand = true;
                        break;
                }
            }
        }
        this.uri = trimEndSlashes(trim(segs.root));
        this.uri += (resourcePath !== '' ? '/' + resourcePath : '');
        this.uri += (qopts !== '' ? '?' + qopts : '');
        return this.uri;
    };

    /**
    * Function that creates a new OData object.
    * @param {!string} uri The uri of the service to query against.
    * @param {?Object.<string, string>} options Custom options to use when querying against the service.
    * @return {OData} A new OData object.
    */
    window.oData = function (uri, options) {
        return new OData(uri, options);
    };
})(window);
