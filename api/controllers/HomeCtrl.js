'use strict';

/*
 * Module Dependencies
 */

var util = require('util');

module.exports = function(app, config) {
    //Root Application
    var ApplicationController = app.getLib('appController');

    function HomeController() {
        ApplicationController.call(this);
    }

    util.inherits(HomeController, ApplicationController);

    HomeController.prototype.index = function index(req, res, next) {
        //Actions here
        return res.sendResponse(200, { welcome: 'Welcome to Rumpelstiltskin!' });
    };

    HomeController.prototype.page = function page(req, res, next) {
        //Actions here
        return res.sendResponse(200, { page: 'Wemcome to Page!' });
    };

    return HomeController;
};

