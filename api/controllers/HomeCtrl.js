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
        var User = app.getModel('User');
        User.find()
            .then(function(users) {
                return res.sendResponse(200, {
                    welcome: 'Welcome to Rumpelstiltskin.js!',
                    users: users
                });
            })
            .catch(function(err) {
                return next(err);
            });

    };

    HomeController.prototype.page = function page(req, res, next) {
        //Actions here
        var User = app.getModel('User'),
            utils = app.getService('utilsService'),
            id = utils.uid(8);
        User.create({
                name: 'Testing',
                username: 'test' + id,
                email: 'test' + id + '@test.com',
                password: '12345678'
            })
            .then(function(user) {
                return res.sendResponse(200, {
                    msg: 'User created successfully!',
                    user: user
                });
            })
            .catch(function(err) {
                return next(err);
            });
    };

    return HomeController;
};
