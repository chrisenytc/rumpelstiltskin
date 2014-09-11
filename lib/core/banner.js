/*
 * rumpelstiltskin
 * https://github.com/chrisenytc/rumpelstiltskin
 *
 * Copyright (c) 2014, Christopher EnyTC
 * Licensed under the MIT license.
 */

'use strict';

/*
 * Module Dependencies
 */

var fs = require('fs'),
    Banner = fs.readFileSync(__dirname + '/banner.txt', 'utf-8');

require('colors');

module.exports = function () {
    console.log();
    console.log(Banner.white.bold);
    console.log();
    console.log(' --------------------------------------------------------------------'.blue);
    console.log('  The powerful framework for making awesome apis with node.js');
    console.log();
    console.log('  Repo => '.bold.white + 'https://github.com/chrisenytc/rumpelstiltskin'.white);
    console.log();
    console.log('  Powered by => '.bold.white + 'Christopher EnyTC'.white);
    console.log(' --------------------------------------------------------------------'.blue);
    console.log();
};
