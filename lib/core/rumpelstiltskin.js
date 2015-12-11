/*
 * rumpelstiltskin
 * https://github.com/chrisenytc/rumpelstiltskin
 *
 * Copyright (c) 2015, Christopher EnyTC
 * Licensed under the MIT license.
 */

'use strict';

/*
 * Module Dependencies
 */

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    debug = require('./debugger.js'),
    Logger = require('./logger.js'),
    join = path.resolve,
    readdir = fs.readdirSync,
    exists = fs.existsSync,
    configStorage = {},
    serviceStorage = {},
    modelStorage = {},
    connectionStorage = {};

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    logger = require('morgan'),
    compression = require('compression'),
    responseTime = require('response-time'),
    cors = require('cors'),
    Waterline = require('waterline'),
    orm = new Waterline();

/*
 * Public Methods
 */

/**
 * @class Rumpelstiltskin
 *
 * @constructor
 *
 * Constructor responsible for provide a application server and helpers
 *
 * @example
 *
 *     var rumpelstiltskin = new Rumpelstiltskin();
 *
 */

var Rumpelstiltskin = module.exports = function() {
    //Get version
    this.version = require('../../package.json').version;
    //Load files
    this.load = function(root, cb) {
        var fullPath = join(__dirname, '..', '..', 'api', root);
        var ENV = process.env.NODE_ENV || 'development';
        //
        if (root === 'config') {
            var configPath = join(fullPath, ENV);
            //Read this directory
            if (exists(configPath)) {
                readdir(configPath).forEach(function(file) {
                    if (fs.statSync(join(configPath, file)).isFile()) {
                        //Resolve file path
                        var filePath = join(configPath, file);
                        //Check if this file exists
                        if (exists(filePath)) {
                            //Run callback
                            var fileName = file.replace(/\.js$/, '');
                            fileName = fileName.replace(/\.json$/, '');
                            cb(filePath, fileName);
                        }
                    }
                });
            } else {
                console.log('ERROR: The '.red + ENV.white + ' environment not exists in api/config'.red);
                process.exit(0);
            }
        } else {
            //Read this directory
            readdir(fullPath).forEach(function(file) {
                if (fs.statSync(join(fullPath, file)).isFile()) {
                    //Resolve file path
                    var filePath = join(fullPath, file);
                    //Check if this file exists
                    if (exists(filePath)) {
                        //Run callback
                        var fileName = file.replace(/\.js$/, '');
                        fileName = fileName.replace(/\.json$/, '');
                        cb(filePath, fileName);
                    }
                }
            });
        }
    };
};

/**
 * Method responsible for load configs
 *
 * @example
 *
 *     rumpelstiltskin.loadConfigs();
 *
 * @method loadConfigs
 * @public
 */

Rumpelstiltskin.prototype.loadConfigs = function loadConfigs() {
    //Load Settings
    this.load('config', function(filePath, fileName) {
        //Require configs
        var config = require(filePath);
        //Set Property
        configStorage[fileName] = config;
    });
    //Debug
    debug('Settings loaded', 'success');
};

/**
 * Method responsible for load all dependencies
 *
 * @example
 *
 *     rumpelstiltskin.loader();
 *
 * @method loader
 * @public
 */

Rumpelstiltskin.prototype.loader = function loader() {
    //Load Services
    this.load('services', function(filePath, fileName) {
        //Check if exists
        if (exists(filePath)) {
            //Require service
            var service = require(filePath);
            serviceStorage[fileName] = service;
        }
    });
    //Debug
    debug('Services loaded', 'success');
    //Load Models
    this.load('models', function(filePath, fileName) {
        //Check if exists
        if (exists(filePath)) {
            //Require Models
            var model = require(filePath);
            var identity = {
                identity: model.identity || fileName.toLowerCase()
            };
            var connection = {
                connection: model.connection || configStorage.database.defaults.connection
            };
            _.extend(model, identity);
            _.extend(model, connection);
            var modelScheme = Waterline.Collection.extend(model);
            orm.loadCollection(modelScheme);
        }
    });
    //Debug
    debug('Models loaded', 'success');
};

/**
 * Method responsible for initialize orm
 *
 * @example
 *
 *     rumpelstiltskin.initalizeOrm(fn);
 *
 * @method initalizeOrm
 * @public
 * @param {Function} cb A callback
 */

Rumpelstiltskin.prototype.initializeOrm = function initializeOrm(cb) {
    //Initialize waterline
    orm.initialize({
        adapters: configStorage.database.adapters,
        connections: configStorage.database.connections,
        defaults: configStorage.database.models
    }, function(err, models) {
        if (err) {
            throw err;
        }
        //Add models
        modelStorage = models.collections;
        connectionStorage = models.connections;
        //Debug
        debug('ORM initialized', 'success');
        //Run callback
        cb();
    });
};

/**
 * Method responsible for configure the server
 *
 * @example
 *
 *     rumpelstiltskin.configureServer();
 *
 * @method configureServer
 * @public
 */

Rumpelstiltskin.prototype.configureServer = function configureServer() {
    //Instance app
    var App = express();
    //Set the node enviornment variable if not set before
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    //Logger
    if (App.get('env') !== 'test') {
        App.use(logger(Logger));
    }

    //Jsonp support
    App.enable('jsonp callback');

    App.set('showStackError', true);

    //ResponseTime
    App.use(responseTime());

    //Compress
    App.use(compression());

    //Headers
    App.use(bodyParser.json());
	App.use(bodyParser.urlencoded({
		extended: true
	}));
    App.use(methodOverride());

    //Cors Options
    var corsOptions = configStorage.cors;
    //Cors
    if (corsOptions.enabled) {
        App.use(cors(corsOptions));
        debug('CORS support enabled', 'success');
    }

    //Request configs
    App.use(function(req, res, next) {
        req.configs = configStorage;
        next();
    });

    //Powered By
    App.use(function(req, res, next) {
        res.removeHeader('X-Powered-By');
        res.setHeader('X-Powered-By', configStorage.app.poweredBy);
        next();
    });

    this.loadMiddlewares(App, function() {
        debug('Middlewares loaded', 'success');
    });

    //Loader webservices
    if (configStorage.app.webservices) {
        this.loadWS(App, function() {
            debug('WebServices loaded', 'success');
        });
    }

    //Loader controllers
    this.loadControllers(App, function() {
        debug('Controllers loaded', 'success');
    });

    //Loader extensions
    this.loadExtensions(App, function() {
        debug('Extensions loaded', 'success');
    });

    //Error 500 Handler
    App.use(function(err, req, res, next) {
        //Error message
        var error = 'An error occurred. Try again!';
        //Handler
        if (err.isPublicError && 'production' === App.get('env')) {
            if (err.message) {
                error = err.message;
            }
        }
        var error500 = configStorage.errors['500'].message.replace(/:method/, req.method).replace(/:path/, req.url);
        res.sendResponse(500, {
            msg: error500,
            error: error,
            documentation_url: configStorage.app.documentation_url
        });
        if ('development' === App.get('env')) {
            if (!err.stack) {
                console.error('Error => ' + err.red);
            } else {
                console.error(err.stack.red);
            }
        }
    });

    //Error 404 Handler
    App.use(function(req, res) {
        var error404 = configStorage.errors['404'].message.replace(/:method/, req.method).replace(/:path/, req.url);
        res.sendResponse(404, {
            url: req.originalUrl,
            error: error404
        });
    });

    //Return Application
    return App;
};

/**
 * Method responsible for get configs
 *
 * @example
 *
 *     rumpelstiltskin.getConfig('fileName');
 *
 * @method getConfig
 * @public
 * @param {String} fileName Name of config file
 */

Rumpelstiltskin.prototype.getConfig = function getConfig(fileName) {

    if (fileName) {
        return configStorage[fileName] || null;
    } else {
        return configStorage || {};
    }
};

/**
 * Method responsible for get services
 *
 * @example
 *
 *     rumpelstiltskin.getService('fileName');
 *
 * @method getService
 * @public
 * @param {String} fileName Name of service file
 */

Rumpelstiltskin.prototype.getService = function getService(fileName) {

    if (_.isFunction(serviceStorage[fileName])) {
        return serviceStorage[fileName].call(this) || null;
    }

    return serviceStorage[fileName] || null;
};

/**
 * Method responsible for get models
 *
 * @example
 *
 *     rumpelstiltskin.getModel('identity');
 *
 * @method getModel
 * @public
 * @param {String} identity Identity of model
 */

Rumpelstiltskin.prototype.getModel = function getModel(identity) {

    if (identity) {
        return modelStorage[identity.toLowerCase()] || null;
    } else {
        return modelStorage || null;
    }
};

/**
 * Method responsible for get connections
 *
 * @example
 *
 *     rumpelstiltskin.getConnection('name');
 *
 * @method getModel
 * @public
 * @param {String} name Name of connection
 */

Rumpelstiltskin.prototype.getConnection = function getConnection(name) {

    if (name) {
        return connectionStorage[name] || null;
    } else {
        return connectionStorage || null;
    }
};

/**
 * Method responsible for get base
 *
 * @example
 *
 *     rumpelstiltskin.getLib('baseApplication');
 *
 * @method getLib
 * @public
 * @param {String} fileName Name of lib file
 */

Rumpelstiltskin.prototype.getLib = function getLib(fileName) {
    //Load Lib
    return require(join(__dirname, '..', fileName));
};

/**
 * Method responsible for load middlewares
 *
 * @example
 *
 *     rumpelstiltskin.loadMiddlewares(App);
 *
 * @method loadMiddlewares
 * @public
 * @param {Object} App Instance of express();
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadMiddlewares = function loadMiddlewares(App, cb) {
    //Load middlewares
    this.load('middlewares', function(filePath) {
        //Check if exists
        if (exists(filePath)) {
            //Require middleware
            var midd = require(filePath);
            //Create ws
            if (midd.enabled) {
                App.use(midd.fn);
            }

        }
    });

    //Run callback
    cb();
};

/**
 * Method responsible for load webservices
 *
 * @example
 *
 *     rumpelstiltskin.loadWS(App, function(){});
 *
 * @method loadWS
 * @public
 * @param {Object} App Instance of express();
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadWS = function loadWS(App, cb) {
    //Load webservices
    this.load('webservices', function(filePath, fileName) {
        //Check if exists
        if (exists(filePath)) {
            //Require webservice
            var ws = require(filePath);
            //Create ws
            App.get('/ws/' + fileName, function(req, res) {
                return res.jsonp(ws);
            });
            //Create ws .json
            App.get('/ws/' + fileName + '.json', function(req, res) {
                return res.jsonp(ws);
            });

        }
    });

    //Run callback
    cb();
};

/**
 * Method responsible for loadding sockets
 *
 * @example
 *
 *     rumpelstiltskin.loadSockets(server, function() {});
 *
 * @method loadSockets
 * @public
 * @param {Object} server Instance of server
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadSockets = function loadSockets(server, cb) {
    var io = require('socket.io').listen(server);

    //rumpelstiltskin instance
    var rumpelstiltskin = new Rumpelstiltskin();

    //Instance
    var loader = this;

    //Loader extensions
    this.loadSocketExtensions(io, function() {
        debug('Socket Extensions loaded', 'success');
    });

    //Sockets
    io.on('connection', function(socket) {

        debug('Client Connected', 'success');

        loader.load('sockets', function(filePath, fileName) {
            //Require configs
            var sockets = require(filePath)({
                getConfig: rumpelstiltskin.getConfig,
                getService: rumpelstiltskin.getService,
                getModel: rumpelstiltskin.getModel,
                getConnection: rumpelstiltskin.getConnection,
                getLib: rumpelstiltskin.getLib
            }, rumpelstiltskin.getConfig());
            //Load All Sockets
            _.each(sockets.prototype, function(s, key) {
                //Handle requests
                if (s.hasOwnProperty('on') && _.isFunction(s.on)) {
                    socket.on(path.join(fileName, key), s.on);
                }
                if (s.hasOwnProperty('emit')) {
                    socket.emit(path.join(fileName, key), s.emit);
                }
            });
        });

        socket.on('disconnect', function() {
            debug('Connection closed', 'error');
        });

    });

    //Run callback
    cb();
};

/**
 * Method responsible for loadding controllers
 *
 * @example
 *
 *     rumpelstiltskin.loadControllers(App, function() {});
 *
 * @method loadControllers
 * @public
 * @param {Object} App Instance of express();
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadControllers = function loadControllers(App, cb) {
    //rumpelstiltskin instance
    var rumpelstiltskin = new Rumpelstiltskin();

    //Routes
    var Routes = require(join(__dirname, '..', '..', 'api', 'routes.js')),
        Policies = require(join(__dirname, '..', '..', 'api', 'policies.js')),
        CTRLSPath = join(__dirname, '..', '..', 'api', 'controllers'),
        PoliciesPath = join(__dirname, '..', '..', 'api', 'policies');

    //Load All Routes
    _.each(Routes, function(route, routePath) {
        //Handle requests
        if (exists(join(CTRLSPath, route.controller.replace(/\.js$/, '') + '.js'))) {

            var Ctrl = require(join(CTRLSPath, route.controller.replace(/\.js$/, '') + '.js'))({
                    getConfig: rumpelstiltskin.getConfig,
                    getService: rumpelstiltskin.getService,
                    getModel: rumpelstiltskin.getModel,
                    getConnection: rumpelstiltskin.getConnection,
                    getLib: rumpelstiltskin.getLib
                }, rumpelstiltskin.getConfig()),
                routePathData = routePath.split(' ');
            //Load actions
            _.each(Ctrl.prototype, function() {

                if (Ctrl.prototype.hasOwnProperty(route.action) && _.isFunction(Ctrl.prototype[route.action])) {

                    if (Policies.hasOwnProperty(route.controller) && Policies[route.controller].hasOwnProperty(route.action) && _.isString(Policies[route.controller][route.action]) && Policies[route.controller][route.action] !== '*') {
                        //Get policie
                        var policie = require(join(PoliciesPath, Policies[route.controller][route.action].replace(/\.js$/, '') + '.js'));
                        //Add policie
                        App[routePathData[0].toLowerCase()](routePathData[1], policie, Ctrl.prototype[route.action]);

                    } else if (Policies.hasOwnProperty(route.controller) && Policies[route.controller].hasOwnProperty(route.action) && _.isFunction(Policies[route.controller][route.action])) {
                        //Add policie
                        App[routePathData[0].toLowerCase()](routePathData[1], Policies[route.controller][route.action], Ctrl.prototype[route.action]);

                    } else if (Policies.hasOwnProperty(route.controller) && Policies[route.controller].hasOwnProperty(route.action) && _.isArray(Policies[route.controller][route.action])) {
                        var PolicieList = [];
                        //Each list
                        _.each(Policies[route.controller][route.action], function(pv, pk) {
                            if (_.isString(pv) && pv !== '*') {
                                //Get policie
                                var aPolicie = require(join(PoliciesPath, Policies[route.controller][route.action][pk].replace(/\.js$/, '') + '.js'));
                                PolicieList.push(aPolicie);
                            } else if (_.isFunction(pv)) {
                                PolicieList.push(pv);
                            }
                        });
                        //Add policie
                        App[routePathData[0].toLowerCase()](routePathData[1], PolicieList, Ctrl.prototype[route.action]);

                    } else if (Policies.hasOwnProperty(route.controller) && Policies[route.controller].hasOwnProperty(route.action) && Policies[route.controller][route.action] === true) {
                        //Create route
                        App[routePathData[0].toLowerCase()](routePathData[1], Ctrl.prototype[route.action]);

                    } else if (Policies.hasOwnProperty(route.controller) && Policies[route.controller].hasOwnProperty('*') && Policies[route.controller]['*']) {
                        //Add policie
                        App[routePathData[0].toLowerCase()](routePathData[1], Ctrl.prototype[route.action]);
                    }

                } else {
                    debug('Have a error on loading ' + route.controller + '@' + route.action, 'error');
                }

            });

        }

    });

    //Run callback
    cb();
};

/**
 * Method responsible for load socket extensions
 *
 * @example
 *
 *     rumpelstiltskin.loadSocketExtensions(io, function(){});
 *
 * @method loadSocketExtensions
 * @public
 * @param {Object} io Instance of socket.io;
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadSocketExtensions = function loadSocketExtensions(io, cb) {
    //Load Extensions
    this.load('../lib/extensions', function(filePath) {
        //Check if exists
        if (exists(filePath)) {
            //Require extension
            var ext = require(filePath);
            //Create extension
            if (ext.hasOwnProperty('core') && ext.core.hasOwnProperty('extends') && ext.core.extends.hasOwnProperty('socket') && typeof ext.core.extends.socket === 'function') {
                ext.core.extends.socket(io);
            }
        }
    });

    //Run callback
    cb();
};

/**
 * Method responsible for load extensions
 *
 * @example
 *
 *     rumpelstiltskin.loadExtensions(App, function(){});
 *
 * @method loadExtensions
 * @public
 * @param {Object} App Instance of express();
 * @param {Function} cb Callback
 */

Rumpelstiltskin.prototype.loadExtensions = function loadExtensions(App, cb) {
    //Load Extensions
    this.load('../lib/extensions', function(filePath) {
        //Check if exists
        if (exists(filePath)) {
            //Require extension
            var ext = require(filePath);
            //Create extension
            if (ext.hasOwnProperty('core') && ext.core.hasOwnProperty('extends') && typeof ext.core.extends === 'function') {
                ext.core.extends(App);
            }
        }
    });

    //Run callback
    cb();
};
