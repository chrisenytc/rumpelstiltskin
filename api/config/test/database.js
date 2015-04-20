'use strict';

/*
 * Module Dependencies
 */

var diskAdapter = require('sails-disk'),
    mongodbAdapter = require('sails-mongo');

module.exports = {
    // Setup Adapters
    // Creates named adapters that have have been required
    adapters: {
        default: diskAdapter,
        disk: diskAdapter,
        mongodb: mongodbAdapter
    },

    // Build Connections Config
    // Setup connections using the named adapter configs
    connections: {
        myLocalDisk: {
            adapter: 'disk'
        },

        myLocalMongoDb: {
            adapter: 'mongodb',
            uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/rumpelstiltskindb'
        }
    },

    defaults: {
        connection: 'myLocalDisk'
    },

    models: {
        migrate: 'safe'
    }
};
