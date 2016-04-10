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


## Installation ##

Install the command line tool globally by running:

    npm install -g npm-dview


## Usage ##

    Usage: npm-dview [options]


## Options ##

    -h, --help           output usage information
    -v, --version        output the version number
    --dep                Show regular dependencies
    --dev                Show development dependencies
    --peer               Show peer dependencies
    --update             Update the package.json file with remote version numbers
    --hideLocal          Hide dependencies which local copy same as requestedVersion
    --excludeCurrent     Exclude up-to-date packages from the output
    --output [type]      Specify the output type [table,json]
    --outputFile <file>  the file to write data to
    --file <file>        The location of the package.json file


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

- Version 2.0.2 - Released Apr 10, 2016
  - add --hideLocal cli option (thanks [@syarul](https://github.com/syarul))

- Version 2.0.1 - Released Apr 9, 2016
  - updating README
  - updating package dependencies

- Version 2.0.0 - Released Aug 25, 2015
  - adding --excludeCurrent command line option.

- Version 1.3.0 - Released Aug 16, 2015
  - adding an --outputFile argument
  - adding a progress bar
  - changing the format of the json output

- Version 1.2.0 - Released Aug 14, 2015
  - Show ticks and crosses in place of boolean (for whether or not version is current)
  - New cli option that allows json to be output instead of a table

- Version 1.1.2 - Released Nov 17, 2014
  - url test now just checks for presence of '/'

- Version 1.1.1 - Released Oct 22, 2014
  - url parsing bugfix.
  - stop trying to get remote version for urls.

- Version 1.1.0 - Released Oct 21, 2014
  - stop processing urls and don't update package.json with ???

- Version 1.0.0 - Released Aug 4, 2014
  - now processing peerDependencies.
  - changed cli option names.
  - auto updating package.json when `--update` option is passed.

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

- Split cli logic into new file, and expose a function that allows other libraries
  to use this via require('npm-dview').


## See Also ##

- [David DM](https://david-dm.org/)
- [updtr](https://github.com/peerigon/updtr)
- [GreenKeeper.io](http://greenkeeper.io/)


## License ##

Copyright (c) 2013 skratchdot  
Licensed under the MIT license.
