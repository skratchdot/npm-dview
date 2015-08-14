#!/usr/bin/env node
/*
 * npm-dview
 * http://skratchdot.com/projects/npm-dview
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
'use strict';

var Table = require('cli-table'),
	async = require('async'),
	colors = require('colors'),
	path = require('path'),
	program = require('commander'),
	exec = require('child_process').exec,
	fs = require('fs'),
	// state / misc variables
	appInfo = require('../package.json'),
	defaultVersion = '???',
	packageInfo,
	showDev = true,
	showRegular = true,
	showPeer = true,
	// taken from: https://github.com/mochajs/mocha/blob/03af0fe3764b718c32a57e47d8cd26f88e72371b/lib/reporters/base.js#L9
	supportsColor = process.browser ? null : require('supports-color'),
	// functions
	getDependencies,
	getLocalPath,
	getLocalVersion,
	printCurrent,
	getOutputTable,
	populateDependencies;

// setup command line options
program
	.version(appInfo.version, '-v, --version')
	.option('--dep', 'Show regular dependencies')
	.option('--dev', 'Show development dependencies')
	.option('--peer', 'Show peer dependencies')
	.option('--update', 'Update the package.json file with remote version numbers')
	.option('--output [type]', 'Specify the output type [table,json]', 'table')
	.option('--file <file>', 'The location of the package.json file',
			path.join(process.cwd(), path.sep, '/package.json'))
	.parse(process.argv);

// which tables do we show?
if (program.dep || program.dev || program.peer) {
	showDev = program.dev ? true : false;
	showRegular = program.dep ? true : false;
	showPeer = program.peer ? true : false;
}

// print processing message
console.log('Processing: ' + program.file);

// process our file
async.series({
	fnExists : function (callback) {
		fs.exists(program.file, function (exists) {
			// cannot find file
			if (!exists) {
				callback('Cannot find the given package.json file: ' + program.file);
			} else {
				callback(null, true);
			}
		});
	},
	fnIsFile : function (callback) {
		fs.stat(program.file, function (err, stats) {
			if (err) { // an error occurred
				callback(err);
			} else if (!stats.isFile()) { // not a file
				callback('This is not a file: ' + program.file);
			} else {
				callback(null, true);
			}
		});
	},
	fnIsJson : function (callback) {
		fs.readFile(program.file, function (err, data) {
			if (err) { // an error occurred
				callback(err);
			} else {
				try {
					packageInfo = JSON.parse(data.toString());
					callback(null, packageInfo);
				} catch (e) {
					callback(e);
				}
			}
		});
	},
	fnProcessDependenciesRegular : function (callback) {
		getDependencies('dependencies', showRegular, callback);
	},
	fnProcessDependenciesDev : function (callback) {
		getDependencies('devDependencies', showDev, callback);
	},
	fnProcessDependenciesPeer : function (callback) {
		getDependencies('peerDependencies', showPeer, callback);
	}
}, function (err, results) {
	var output = '';
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		if (program.output.toLowerCase() === 'json') {
			output = {
				regular: results.fnProcessDependenciesRegular,
				dev: results.fnProcessDependenciesDev,
				peer: results.fnProcessDependenciesPeer
			};
			// sections with no dependecies should be an empty array
			Object.keys(output).forEach(function (key) {
				if (output[key].length === 1 && output[key][0].hasOwnProperty('noKey')) {
					output[key] = [];
				}
			});
			console.log(JSON.stringify(output, null, '  '));
		} else {
			output += getOutputTable('dependencies', results.fnProcessDependenciesRegular);
			output += getOutputTable('devDependencies', results.fnProcessDependenciesDev);
			output += getOutputTable('peerDependencies', results.fnProcessDependenciesPeer);
			console.log(output);
		}
		if (program.update) {
			fs.writeFile(program.file, JSON.stringify(packageInfo, null, '  '));
		}
	}
});

printCurrent = function (value) {
	var currentMark;
	// adapted from:
	// https://github.com/mochajs/mocha/blob/03af0fe3764b718c32a57e47d8cd26f88e72371b/lib/reporters/base.js#L78-L89
	if (process.platform === 'win32') {
		currentMark = value ? '\u221A' : '\u00D7';
	} else {
		currentMark = value ? '✓' : '✖';
	}
	if (supportsColor) {
		currentMark = value ? colors.green(currentMark) : colors.red(currentMark);
	}
	return currentMark;
};

getOutputTable = function (key, items) {
	var i,
		item,
		titles = {
			'dependencies': 'Regular Dependencies',
			'devDependencies': 'Dev Dependencies',
			'peerDependencies': 'Peer Dependencies'
		},
		table = new Table({
			head: ['Module Name', 'Requested', 'Local', 'Remote', 'Current?'],
			colWidths: [27, 18, 8, 8, 10]
		});
	if (items.length > 0) {
		for (i = 0; i < items.length; i++) {
			item = items[i];
			if (item.hasOwnProperty('noKey')) {
				table = new Table({
					head: ['Warning']
				});
				table.push(['No dependencies found in the package.json file']);
				break;
			} else {
				table.push([
					item.moduleName,
					item.requestedVersion,
					item.localVersion,
					item.remoteVersion,
					printCurrent(item.localVersion === item.remoteVersion)
				]);
				if (program.update && item.remoteVersion !== defaultVersion) {
					packageInfo[key][item.moduleName] = item.requestedPrefix + item.remoteVersion;
				}
			}
		}
		return '\n' + titles[key] + '\n' + table.toString() + '\n';
	}
};

getDependencies = function (dependencyKey, isEnabled, callback) {
	var results = [], depKey, dep, deps;
	if (isEnabled && !packageInfo.hasOwnProperty(dependencyKey)) {
		callback(null, [{
			noKey: dependencyKey
		}]);
	} else if (!isEnabled) {
		callback(null, []);
	} else {
		deps = packageInfo[dependencyKey];
		for (depKey in deps) {
			if (deps.hasOwnProperty(depKey)) {
				dep = deps[depKey];
				results.push({
					moduleName : depKey,
					requestedVersion : dep,
					localVersion : defaultVersion,
					remoteVersion : defaultVersion,
					requestedPrefix: dep.trim().match(/^(\~|\^|\>\=|\>|\=)*(.*)/)[1] || ''
				});
			}
		}
		populateDependencies(results, callback);
	}
};

populateDependencies = function (results, callback) {
	async.map(results, function (item, cb) {
		var isUrl = /\//gi.test(item.requestedVersion),
			localPath = getLocalPath(program.file);
		item.localVersion = getLocalVersion(localPath, item.moduleName);
		if (isUrl) {
			cb(null, item);
		} else {
			exec('npm view ' + item.moduleName + ' version', function (err, stdout) {
				var reStart = new RegExp('^\\s*'),
					reEnd = new RegExp('\\s*$'),
					out;
				if (err) {
					cb(err);
				} else {
					out = stdout.replace(reStart, '').replace(reEnd, '');
					if (out.length > 0) {
						item.remoteVersion = out;
					}
					cb(null, item);
				}
			});
		}
	}, function (err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

getLocalPath = function (packagePath) {
	return path.join(path.dirname(packagePath), path.sep, 'node_modules');
};

getLocalVersion = function (localPath, moduleName) {
	var version = defaultVersion,
		filename = path.join(localPath, path.sep, moduleName, path.sep, 'package.json'),
		packageInfo;
	try {
		packageInfo = require(filename);
		if (packageInfo.hasOwnProperty('version')) {
			version = packageInfo.version;
		}
	} catch (e) {}
	return version;
};
