var assert = require("assert");
var DirecTV = require('./index.js');

// These tests require a Whole-Home DVR setup and for the main box to be turned on.
// Populate the following two variables with valid addresses:
var ipAddr = '192.168.1.102';
var clientAddr = '88F7C7DA0264';

var badipAddr1 = '192.168.abc.1';
var badipAddr2 = '192.168.100.100';
var badClientAddr = '1123123';

describe('DirecTV', function(){
    describe('validateIP()', function(){
        it('should return an error when given an invalid IPv4 address', function(done){
            DirecTV.validateIP(badipAddr1, function(err) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return a timeout error upon request to non-existent server', function(done){
            DirecTV.validateIP(badipAddr2, function(err) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should not return an error when a valid Set Top Box is found', function(done){
            DirecTV.validateIP(ipAddr, function(err) {
                assert.equal(null, err);
                done();
            });
        });
    });
    describe('Remote()', function(){
        it('should return an object when given an IP address', function(){
            assert.equal('object', (typeof new DirecTV.Remote(ipAddr)));
        });
        it('should throw an error when not given an IP address', function(){
            var err;
            try {
                var Remote = new DirecTV.Remote();
            } catch (e) {
                err=e;
            }
            assert.equal('string', (typeof err.message));
        });
    });
});

describe('Remote', function(){
    describe('getOptions()', function(){
        it('should return an object', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getOptions(function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
    });

    describe('getLocations()', function(){
        it('should return an object when not given a type', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations(undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given type 0', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations(0, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given type 1', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations(1, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given an invalid type', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations(2, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });

    describe('getSerialNum()', function(){
        it('should return an object when not given a clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getSerialNum(undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given a valid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getSerialNum(clientAddr, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given an invalid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getSerialNum(badClientAddr, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });

    describe('getVersion()', function(){
        it('should return an object', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getVersion(function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
    });

    describe('getMode()', function(){
        it('should return an object when not given a clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getMode(undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given a valid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getMode(clientAddr, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given an invalid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getMode(badClientAddr, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });

    describe('processKey()', function(){
        it('should return an error when given an invalid key', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processKey(undefined, undefined, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid key and no clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processKey('guide', undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given a valid key and a valid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processKey('exit', clientAddr, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given a valid key and an invalid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processKey('exit', badClientAddr, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });

    describe('processCommand()', function() {
        it('should return an error when given an invalid cmd', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processCommand(undefined, function (err, response) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid cmd', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.processCommand('FA91', function (err, response) {
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
    });

    describe('getProgInfo()', function() {
        // in order to get a valid epoch timestamp for testing, we'll pull one out of a valid response
        var startTime;
        it('should return an error when given an invalid channel', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(undefined, undefined, undefined, function (err, response) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid channel', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(296, undefined, undefined, function (err, response) {
                if (err) throw err;
                // parse the start time out so we can use it in the next tests
                startTime=response.startTime + 3600;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given a valid channel and an invalid startTime', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(296, 'garbageText', undefined, function (err, response) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid channel and a valid startTime', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(296, startTime, undefined, function (err, response) {
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given a valid channel, a valid startTime and an invalid clientAddr', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(296, startTime, badClientAddr, function (err, response) {
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid channel, a valid startTime and a valid clientAddr', function (done) {
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getProgInfo(296, startTime, clientAddr, function (err, response) {
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
    });

    describe('getTuned()', function(){
        it('should return an object when not given a clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getTuned(undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given a valid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getTuned(clientAddr, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given an invalid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getTuned(badClientAddr, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });

    // STILL NEED TO TEST THE tune() FUNCTION
    describe('tune()', function(){
        it('should return an error when not given a channel', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.tune(undefined, undefined, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
        it('should return an object when given a valid channel', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.tune(297, undefined, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an object when given a valid channel and a valid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.tune(296, clientAddr, function(err,response){
                if (err) throw err;
                assert.equal('object', (typeof response));
                done();
            });
        });
        it('should return an error when given an invalid clientAddr', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.tune(297, badClientAddr, function(err,response){
                assert.equal('string', (typeof err.message));
                done();
            });
        });
    });
});

describe('Miscellaneous', function(){
    describe('Synchronous calls', function(){
        // using getLocations() as an example of synchronous calls
        it('should log output rather than return data', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations(1);
            setTimeout(done, 1000);
        });
        it('should log errors rather than return as well', function(done){
            var Remote = new DirecTV.Remote(ipAddr);
            Remote.getLocations('2');
            setTimeout(done, 1000);
        });
    });
});
