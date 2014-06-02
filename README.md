# npm-dview

[![Build Status](https://travis-ci.org/skratchdot/npm-dview.png?branch=master)](https://travis-ci.org/skratchdot/npm-dview)
[![Coverage Status](https://coveralls.io/repos/skratchdot/npm-dview/badge.png)](https://coveralls.io/r/skratchdot/npm-dview)
[![Dependency Status](https://david-dm.org/skratchdot/npm-dview.svg)](https://david-dm.org/skratchdot/npm-dview)
[![devDependency Status](https://david-dm.org/skratchdot/npm-dview/dev-status.svg)](https://david-dm.org/skratchdot/npm-dview#info=devDependencies)

## Description ##

npm-dview is a command line tool for comparing a package.json file's dependency version
numbers with the latest remote version number.  
  
It compares both "dependencies" and/or "devDependencies".  
  
It accomplishes this by calling "npm view MODULE_NAME version" for each dependency listed
in your package.json file.

For a webservice version of this, visit https://david-dm.org/


## Installation ##

Install the command line tool globally by running:

	npm install -g npm-dview


## Usage ##

	Usage: npm-dview [options]


## Options ##

	-h, --help     output usage information
	-v, --version  output the version number
	--dep-only     Only show regular dependencies
	--dev-only     Only show development dependencies
	--file <file>  The location of the package.json file


## Screenshots ##

#### Default Usage: ####

![Default Usage](https://github.com/skratchdot/npm-dview/raw/master/screenshots/default.png)  

#### Help: ####

![Help](https://github.com/skratchdot/npm-dview/raw/master/screenshots/help.png)  

#### List Regular Dependencies Only: ####

![List Regular Dependencies Only](https://github.com/skratchdot/npm-dview/raw/master/screenshots/dep-only.png)  


## Contributing ##

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code 
using [Grunt](http://gruntjs.com/).


## Release History ##

- Version 0.3.0 - Released June 2, 2014

  - No longer throwing error when only devDependencies are found

- Version 0.2.0 - Released May 18, 2013

  - Adding hardcoded column widths

- Version 0.1.1 - Released May 3, 2013

  - New columns: "Local" and "Current?"
  - Changed column name: "Requested Version" -> "Requested"
  - Changed column name: "Remote Version" -> "Remote"
  - Updating "async" version

- Version 0.1.0 - Released April 13, 2013

  - Initial Implementation


## Todo ##

- Add unit tests

- Show progress bar/message while making remote calls


## License ##

Copyright (c) 2013 skratchdot  
Licensed under the MIT license.

