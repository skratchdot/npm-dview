# npm-dview


## Description ##

npm-dview is a command line tool for comparing a package.json file's dependency version
numbers with the latest remote version number.  
  
It compares both "dependencies" and/or "devDependencies".  
  
It accomplishes this by calling "npm view MODULE_NAME version" for each dependency listed
in your package.json file.


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

- Version 0.1.0 - Released April 13, 2013

  - Initial Implementation

- Version 0.1.1 - Released May 3, 2013

  - New columns: "Local" and "Current?"
  - Changed column name: "Requested Version" -> "Requested"
  - Changed column name: "Remote Version" -> "Remote"
  - Updating "async" version


## Todo ##

- Add unit tests

- Show progress bar/message while making remote calls


## License ##

Copyright (c) 2013 skratchdot  
Licensed under the MIT license.

