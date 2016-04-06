'use strict';

var exec = require('child_process').exec;
var execPrefix = 'node ' + __dirname + '/../lib/npm-dview.js ';
var packageJson = require('../package.json');
var regexHeaderFound = new RegExp('Module Name', 'g');
var regexHeaderNotFound = new RegExp('Warning', 'g');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['npm-dview tests'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'npm-dview --version': function (test) {
		test.expect(3);
		exec(execPrefix + '--version', function (error, stdout, stderr) {
			test.equal(error, null, 'should be null');
			test.equal(stdout, packageJson.version + '\n', 'should be: ' + packageJson.version);
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview': function (test) {
		exec(execPrefix, function (error, stdout, stderr) {
			var res = stdout.match(regexHeaderFound) || [];
			test.expect(2);
			test.equal(res.length, 2, 'should show 2 tables');
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview --dep': function (test) {
		exec(execPrefix + '--dep', function (error, stdout, stderr) {
			var res = stdout.match(regexHeaderFound) || [];
			test.expect(2);
			test.equal(res.length, 1, 'should show 1 table');
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview --dev': function (test) {
		exec(execPrefix + '--dev', function (error, stdout, stderr) {
			var res = stdout.match(regexHeaderFound) || [];
			test.expect(2);
			test.equal(res.length, 1, 'should show 1 table');
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview --peer': function (test) {
		exec(execPrefix + '--peer', function (error, stdout, stderr) {
			var res = stdout.match(regexHeaderNotFound) || [];
			test.expect(2);
			test.equal(res.length, 1, 'should show 1 table');
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview --hideLocal': function (test) {
		exec(execPrefix + '--hideLocal', function (error, stdout, stderr) {
			var res = stdout.match(regexHeaderNotFound) || [];
			test.expect(2);
			test.equal(res.length, 1, 'should show 1 table');
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'npm-dview --file': function (test) {
		exec(execPrefix + '--file', function (error, stdout, stderr) {
			test.expect(1);
			test.equal(stderr, '\n  error: option `--file <file>\' argument missing\n\n',
				'should have shown an error message');
			test.done();
		});
	},
	'npm-dview --file invalidFilename': function (test) {
		exec(execPrefix + '--file invalidFilename', function (error, stdout, stderr) {
			test.expect(1);
			test.equal(stderr, 'Cannot find the given package.json file: invalidFilename\n');
			test.done();
		});
	},
};
