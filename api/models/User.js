'use strict';

/*
 * User Schema
 */

module.exports = {
    tableName: 'users',

    attributes: {
        name: {
            type: 'string',
            required: true,
            minLength: 3
        },

        username: {
            type: 'string',
            unique: true,
            required: true,
            alphanumeric: true
        },

        email: {
            type: 'string',
            unique: true,
            required: true,
            email: true
        },

        password: {
            type: 'string',
            required: true
        }
    }
};
