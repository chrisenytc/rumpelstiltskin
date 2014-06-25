'use strict';

var chai = require('chai');
chai.expect();
chai.should();

var Rumpelstiltskin = require('../lib/core/rumpelstiltskin.js'),
    rumpelstiltskin = new Rumpelstiltskin();

describe('rumpelstiltskin module', function() {

    describe('#constructor()', function() {

        it('should be a function', function() {

            Rumpelstiltskin.should.be.a('function');

        });
    });

    describe('#instance()', function() {

        it('should be a object', function() {

            rumpelstiltskin.should.be.a('object');
            
        });
    });
});
