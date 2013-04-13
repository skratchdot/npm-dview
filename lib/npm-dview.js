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
	program = require('commander'),
	exec = require('child_process').exec,
	fs = require('fs'),
	// state / misc variables
	appInfo = require('../package.json'),
	packageInfo,
	showDev = true,
	showRegular = true,
	// functions
	getDependencies,
	printTable,
	populateDependencies;

// setup command line options
program
	.version(appInfo.version, '-v, --version')
	.option('--dep-only', 'Only show regular dependencies')
	.option('--dev-only', 'Only show development dependencies')
	.option('--file <file>', 'The location of the package.json file', './package.json')
	.parse(process.argv);

// which tables do we show?
if (program.devOnly && !program.depOnly) {
	showRegular = false;
} else if (program.depOnly) {
	showDev = false;
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
	}
}, function (err, results) {
	if (err) {
		throw err;
	} else {
		printTable('Regular Dependencies', results.fnProcessDependenciesRegular);
		printTable('Dev Dependencies', results.fnProcessDependenciesDev);
	}
});

printTable = function (title, items) {
	var i,
		item,
		table = new Table({
			head: ['Module Name', 'Requested Version', 'Remote Version']
		});
	if (items.length > 0) {
		for (i = 0; i < items.length; i++) {
			item = items[i];
			table.push([item.moduleName, item.requestedVersion, item.remoteVersion]);
		}
		console.log(title);
		console.log(table.toString());
	}
};

getDependencies = function (dependencyKey, isEnabled, callback) {
	var results = [], depKey, dep, deps;
	if (isEnabled && !packageInfo.hasOwnProperty(dependencyKey)) {
		callback('The package.json file specified does not contain the following key: ' + dependencyKey);
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
					remoteVersion : null
				});
			}
		}
		populateDependencies(results, callback);
	}
};

populateDependencies = function (results, callback) {
	async.map(results, function (item, cb) {
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
	}, function (err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};
