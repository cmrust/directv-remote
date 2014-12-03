directv-remote
==============

Node.js module for manipulating DirecTV STBs (Set Top Boxes) over their REST API

Setup
-----

Install from npm:

    npm install directv-remote

For full functionality make sure to enable external device access on your cable box:

    Menu > Settings > Whole-Home > External Device > Allow

Usage Notes
-----------

See the API spec below for actual usage examples.

Instantiate a Remote class using the IP address of a valid STB, then call any of the Remote's functions to actually talk to the box.

Functions can be called with or without callback functions. If you choose to forego a callback function, it's output will be logged to the console instead of returned.

If you choose not to pass in an optional parameter but are still using the callback function, you'll need to pass undefined in place of the missing param. I plan to refactor to remove this annoyance, but as of now it's not a priority.

There is a Mocha test suite in the test.js file, that consists of a number of integration tests. These tests require a Whole-Home DVR setup (Genie STBs) and actually send commands to the boxes while expecting real responses. This is also a good example of this library's functionality.

API
---
### DirecTV.validateIP(ipAddr, callback)
Verify that an IP address is in fact that of a valid DirecTV Set Top Box.

The parameter **ipAddr** is required and expected to be a string.

No arguments other than a possible exception are given to the completion **callback**. If err is undefined, this it is a valid Set Top Box.

Example:
```
var DirecTV = require('directv-remote');
var ipAddr = '192.168.1.103';

DirecTV.validateIP(ipAddr, function(err) {
    if (err) return console.log(err);
    console.log(ipAddr, 'is a valid STB');
});

// returns '192.168.1.103 is a valid STB'
```

### DirecTV.Remote(ipAddr)
Instantiates a DirecTV Remote object. The resulting object will be referred to as Remote from here forward.

The parameter **ipAddr** is required and expected to be a string.

Example:
```
// Create a new Remote
var Remote = new DirecTV.Remote(ipAddr);
```

### Remote.getOptions([callback])
Lists the available endpoints on the system.

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getOptions(function(err,response) {
    if (err) return console.log(err);
    console.log(response);
});

// has the same effect as

Remote.getOptions();

// for compactness, callback functions will not be shown in the rest of the examples
```

### Remote.getLocations([type], [callback])
Returns an array of the networked Set Top Boxes.

The parameter **type** is an optional parameter. The documentation labels it as an int and during my testing the only values that don't return *Forbidden* are 0 and 1. With Whole-Home DVR (Genie STBs) enabled in my house, passing 1 shows currently offline STBs.

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getLocations(1);
```

### Remote.getSerialNum([clientAddr], [callback])
Returns the serial number of the Set Top Box.

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getSerialNum('88F7C7DA0264');
```

### Remote.getVersion([callback])
Returns Set Top Box version information as well as a systemTime property, which is the current epoch timestamp.

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getVersion();
```

### Remote.getMode([clientAddr], [callback])
Returns the mode that the Set Top Box is currently operating in. It seems this returned mode property reflects the status active (0) or inactive (1), though this isn't documented behavior.

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getMode('88f7c7da1456');
```

### Remote.processKey(key, [clientAddr], [callback])
Send standard remote control key presses to the STB.

The parameter **key** is a required string value, that corresponds to buttons on the remote, such as:
<br>*format, power, rew, pause, play, stop, ffwd, replay, advance, record, guide, active, list, exit, up, down, select, left, right, back, menu, info, red, green, yellow, blue, chanup, chandown, prev, 1, 2, 3, 4, 5, 6, 7, 8, 9, dash, 0, enter*

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.processKey('guide', '88F7C7DA0264');
```

### Remote.processCommand(cmd, [callback])
Send command request to the STB.

The parameter **cmd** is a required hex value, such as:

| Command | Definition |
|---------|------------|
| FA81 | Standby |
| FA82 | Active |
| FA83 | GetPrimaryStatus |
| FA84 | GetCommandVersion |
| FA87 | GetCurrentChannel |
| FA90 | GetSignalQuality |
| FA91 | GetCurrentTime |
| FA92 | GetUserCommand |
| FA93 | EnableUserEntry |
| FA94 | DisableUserEntry |
| FA95 | GetReturnValue |
| FA96 | Reboot |
| FAA5 | SendUserCommand |
| FAA6 | OpenUserChannel |
| FA9A | GetTuner |
| FA8A | GetPrimaryStatusMT |
| FA8B | GetCurrentChannelMT |
| FA9D | GetSignalQualityMT |
| FA9F | OpenUserChannelMT |

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.processCommand('FA91')
```

### Remote.getProgInfo(channel, [startTime], [clientAddr], [callback])
Returns program information for the specified channel, time and STB.

The parameter **channel** is required and is an int.

The optional parameter **startTime** is an epoch timestamp int, the default if not provided is now.

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getProgInfo(300, 1416999600)

// returns info about the program airing on channel 300 at 1416999600
```

### Remote.getTuned([clientAddr], [callback])
Returns information about the program currently being viewed.

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.getTuned()
```

### Remote.tune(channel, [clientAddr], [callback])
Tunes the STB to a specific channel.

The parameter **channel** is required and is an int.

The parameter **clientAddr** is an optional string used to specify a separate networked STB. This is the same **clientAddr** referenced in the response from getLocations().

The optional **callback** function accepts two parameters, an error and the response.
If the optional **callback** parameter is not provided, then the response or error are simply printed to the console upon completion.

Example:
```
Remote.tune(299, '88F7C7DA0264')
```

Credit
------
This code is loosely based on the research done by Jeremy Whitlock for his [directv-remote-api](https://github.com/whitlockjc/directv-remote-api) project. It has been rewritten from the ground up to work on Node.js, without the jQuery and Underscore.js deps.

To-Do List
----------

* implement key holds
* write better API examples that show manipulation of returned data
* refactor to combine the multiple parameters of each function into an options object
