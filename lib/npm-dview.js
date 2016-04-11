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
	ProgressBar = require('progress'),
	// state / misc variables
	appInfo = require('../package.json'),
	bar,
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
	.option('--hideLocal', 'Hide dependencies which local copy same as requestedVersion')
	.option('--excludeCurrent', 'Exclude up-to-date packages from the output')
	.option('--output [type]', 'Specify the output type [table,json]', 'table')
	.option('--outputFile <file>', 'the file to write data to')
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
				dependencies: results.fnProcessDependenciesRegular,
				devDependencies: results.fnProcessDependenciesDev,
				peerDependencies: results.fnProcessDependenciesPeer
			};
			// sections with no dependecies should be an empty array
			Object.keys(output).forEach(function (key) {
				if (output[key].length === 1 && (
						output[key][0].hasOwnProperty('noKey') ||
						output[key][0].hasOwnProperty('allExcluded')
					)) {
					output[key] = [];
				}
			});
			output = JSON.stringify(output, null, '  ');
		} else {
			output += getOutputTable('dependencies', results.fnProcessDependenciesRegular);
			output += getOutputTable('devDependencies', results.fnProcessDependenciesDev);
			output += getOutputTable('peerDependencies', results.fnProcessDependenciesPeer);
		}
		// output to console
		console.log(output);
		// output to file (if necessary)
		if (typeof program.outputFile === 'string' && program.outputFile.length > 0) {
			fs.writeFileSync(program.outputFile, output, 'utf-8');
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

var has_ = [false, false, false];
var noKey_ = [false, false, false];
var depsKey_ = ['dependencies', 'devDependencies', 'peerDependencies'];

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

	var oldItems = items.map(function(e){
		return e;
	});

	var flag = items.map(function(e){
		if (e.requestedVersion) {
			return (e.requestedVersion).replace(/[<>=~^]/gi, '');
		}
	});
	var newItems = [];
	if (program.hideLocal){
		oldItems.forEach(function(e, i){
			if (flag[i] !== e.localVersion && ~i) {
				newItems.push(e);
				depsKey_.forEach(function(e, i){
					if (e === key){
						has_[i] = true;
					}
				});
			} else if (!flag[i]) {
				depsKey_.forEach(function(e, i){
					if (e === key){
						noKey_[i] = true;
					}
				});
			}
		});

		for(i = 0; i < has_.length; i++){
			if(depsKey_[i] === key && has_[i] === false && noKey_[i] === false){
				newItems.push({allExcluded: key});
			}
			if(depsKey_[i] === key && noKey_[i] === true){
				newItems.push({noKey: key});
			}
		}

	} else {
		newItems = oldItems;
	}

	if (newItems.length > 0) {
		for (i = 0; i < newItems.length; i++) {
			item = newItems[i];
			if (item.hasOwnProperty('noKey')) {
				table = new Table({
					head: ['Warning']
				});
				table.push(['No dependencies found in the package.json file']);
				break;
			} else if (item.hasOwnProperty('allExcluded')) {
				table = new Table({
					head: ['Information']
				});
				table.push(['All dependencies are up-to-date']);
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
	// destroy existing progress bar
	if (bar) {
		bar.terminate();
	}
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
					moduleName: depKey,
					requestedVersion: dep,
					localVersion: defaultVersion,
					remoteVersion: defaultVersion,
					requestedPrefix: dep.trim().match(/^(\~|\^|\>\=|\>|\=)*(.*)/)[1] || ''
				});
			}
		}
		bar = new ProgressBar('Processing: ' + dependencyKey + ' :current of :total [:bar] :percent :elapseds', {
			total: results.length
		});
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
				bar.tick();
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
		var results = [], hasItems = res.length > 0;
		bar.terminate();
		if (err) {
			callback(err);
		} else {
			if (program.excludeCurrent && hasItems) {
				res.forEach(function (item) {
					if (item.localVersion !== item.remoteVersion) {
						results.push(item);
					}
				});
				if (results.length === 0) {
					results = [{
						allExcluded: true
					}];
				}
			} else {
				results = res;
			}
			callback(null, results);
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
