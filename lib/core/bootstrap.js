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

var Rumpelstiltskin = require('./rumpelstiltskin.js'),
    rumpelstiltskin = new Rumpelstiltskin(),
    http = require('http'),
    debug = require('./debugger.js'),
    banner = require('./banner.js');

exports.run = function() {
    //Banner
    banner();
    //Load configs
    rumpelstiltskin.loadConfigs();
    //Load dependencies
    rumpelstiltskin.loader();
    //Start server
    var App = rumpelstiltskin.configureServer(),
        Server = http.createServer(App).listen(rumpelstiltskin.getConfig('app').port, function() {
            debug('Server running on port '.green + ' [ ' + String(rumpelstiltskin.getConfig('app').port).bold + ' ]', 'success');
        });
    //Start sockets
    if (rumpelstiltskin.getConfig('app').sockets) {
        rumpelstiltskin.loadSockets(Server, function() {
            debug('Sockets loaded', 'success');
        });
    }
};
