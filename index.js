var http = require('http');
var qs = require("querystring");

module.exports.validateIP = function(IP_ADDRESS, callback){
    if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(IP_ADDRESS)) {
        callback(new Error('This is not a valid IPv4 address: ' + IP_ADDRESS));
    }

    var options = {
        hostname: IP_ADDRESS,
        port: 8080,
        path: '/info/getLocations'
    };

    const TIMEOUT_DURATION = 3000;

    var req = http.request(options, function(res) {
        var body = "";
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            try {
                var parsedBody = JSON.parse(body);
            } catch (err) {
                callback(new Error('Parsing the request body failed: ' + err));
            }
            if (typeof parsedBody !== 'undefined' && typeof parsedBody.status !== 'undefined') {
                if (parsedBody.status.code !== 200) {
                    callback(new Error('Host does not appear to be a valid STB: ' + parsedBody.status.code + ' (' + parsedBody.status.msg + ')'));
                } else {
                    callback(null);
                }
            } else {
                callback(new Error('Host does not appear to be a valid STB'));
            }
        });
    });

    req.on('error', function(err) {
        if (err.message !== 'socket hang up') {
            callback(new Error('HTTP request failed: ' + err));
        }
    });

    req.setTimeout(TIMEOUT_DURATION, function() {
        req.abort();
        callback(new Error('HTTP request timed out after ' + TIMEOUT_DURATION + ' ms'));
    });

    req.end();
}

module.exports.Remote = function(ipAddress) {
    this.IP_ADDRESS = ipAddress;
    this.port = '8080';

    // Lists the available endpoints on the system
    this.getOptions = function(callback){
        var path = '/info/getOptions';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        makeRequest(options, callbackHandler(callback));
    };

    // "List of available client locations."
    // Returns an array of the networked set top boxes
    // type is an optional parameter
    //  the docs label it as 'int'
    //  only 0 and 1 aren't *Forbidden*
    //  i'm not sure what the difference is yet,
    //  but 1 shows more of my wireless Genie STBs
    this.getLocations = function(type, callback){
        var path = '/info/getLocations';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        if (typeof type !== 'undefined') {
            options.path = buildQueryString(options.path, { type: type });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "STB serial number."
    // clientAddr is optional and for specifying a separate networked STB
    this.getSerialNum = function(clientAddr, callback){
        var path = '/info/getSerialNum';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "Set-top-box and SHEF information."
    // Also returns the systemTime property, which is the current epoch timestamp.
    this.getVersion = function(callback){
        var path = '/info/getVersion';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        makeRequest(options, callbackHandler(callback));
    };

    // "Set-top-box mode."
    // clientAddr is optional and for specifying a separate networked STB
    // It seems the returned mode property reflects the statuses active (1) and inactive (0)
    this.getMode = function(clientAddr, callback){
        var path = '/info/mode';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "Process a key request from the remote control."
    // key is a required string value, that corresponds to buttons on the remote, such as:
    // format, power, rew, pause, play, stop, ffwd, replay, advance, record, guide, active, list, exit, up, down, select, left, right, back, menu, info, red, green, yellow, blue, chanup, chandown, prev, 1, 2, 3, 4, 5, 6, 7, 8, 9, dash, 0, enter
    this.processKey = function(key, clientAddr, callback){
        var path = '/remote/processKey';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path + '?key=' + key
        };

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "Process a command request from remote control."
    // cmd is a required hex value, such as:
    // 'FA81' Standby
    // 'FA82' Active
    // 'FA83' GetPrimaryStatus
    // 'FA84' GetCommandVersion
    // 'FA87' GetCurrentChannel
    // 'FA90' GetSignalQuality
    // 'FA91' GetCurrentTime
    // 'FA92' GetUserCommand
    // 'FA93' EnableUserEntry
    // 'FA94' DisableUserEntry
    // 'FA95' GetReturnValue
    // 'FA96' Reboot
    // 'FAA5' SendUserCommand
    // 'FAA6' OpenUserChannel
    // 'FA9A' GetTuner
    // 'FA8A' GetPrimaryStatusMT
    // 'FA8B' GetCurrentChannelMT
    // 'FA9D' GetSignalQualityMT
    // 'FA9F' OpenUserChannelMT
    this.processCommand = function(cmd, callback){
        var path = '/serial/processCommand';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path + '?cmd=' + cmd
        };

        makeRequest(options, callbackHandler(callback));
    };

    // "Program information of specified channel at current or specific time."
    // Returns program information for the specified channel, time and STB
    // startTime is an optional epoch timestamp, default is now
    // clientAddr is optional and for specifying a separate networked STB
    this.getProgInfo = function(channel, startTime, clientAddr, callback){
        var path = '/tv/getProgInfo';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path + '?major=' + channel
        };

        if (typeof startTime !== 'undefined') {
            options.path = buildQueryString(options.path, { time: startTime });
        }

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "Information about the currently viewed program."
    // clientAddr is optional and for specifying a separate networked STB
    this.getTuned = function(clientAddr, callback){
        var path = '/tv/getTuned';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path
        };

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // "Tune to a channel."
    // clientAddr is optional and for specifying a separate networked STB
    this.tune = function(channel, clientAddr, callback){
        var path = '/tv/tune';

        var options = {
            hostname: this.IP_ADDRESS,
            port: 8080,
            path: path + '?major=' + channel
        };

        if (typeof clientAddr !== 'undefined') {
            options.path = buildQueryString(options.path, { clientAddr: clientAddr });
        }

        makeRequest(options, callbackHandler(callback));
    };

    // This is a utility function that allows the same optional callback for all of the separate Remote functions
    var callbackHandler = function(callback) {
        return function(err, response) {
            if (typeof callback !== 'undefined') {
                if (err) {
                    callback(err);
                } else {
                    callback(null, response);
                }
            } else {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                }
            }
        }
    };

    // This is a utility function for building URL paths
    var buildQueryString = function(path, qs) {
        firstVar = (path.indexOf('?') === -1) ? true : false;
        for (prop in qs) {
            if (firstVar) {
                path = path + '?' + prop + '=' + qs[prop];
                firstVar = false;
            } else {
                path = path + '&' + prop + '=' + qs[prop];
            }
        }
        return path;
    };

    // This is the shared function that actually makes the HTTP requests
    var makeRequest = function(options, callback){
        var body = '';
        http.get(options, function(res) {
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                try {
                    var parsedBody = JSON.parse(body);
                } catch (err) {
                    callback(new Error('Parsing the request body failed: ' + err));
                }
                if (typeof parsedBody !== 'undefined' && typeof parsedBody.status !== 'undefined') {
                    console.log('Path:',parsedBody.status.query);
                    if (parsedBody.status.code !== 200) {
                        callback(new Error('Received bad response code: ' + parsedBody.status.code + ' (' + parsedBody.status.msg + ')'));
                    } else {
                        delete parsedBody.status;
                    }
                }
                callback(null, parsedBody);
            });
        }).on('error', function(err) {
            callback(new Error('HTTP request failed: ' + err));
        });
    };
};