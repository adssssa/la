var should = require('should'), // jshint ignore:line
    configUtils = require('../../../server/config/utils');

describe('UNIT: Config utils', function () {
    describe('makePathsAbsolute', function () {
        it('ensure we change paths only', function () {
            var changedKey = [],
                obj = {
                    database: {
                        client: 'mysql',
                        connection: {
                            filename: 'content/data/ghost.db'
                        }
                    }
                };

            this.set = function (key, value) {
                changedKey.push([key, value]);
            };

            configUtils.makePathsAbsolute.bind(this)(obj.database, 'database');

            changedKey.length.should.eql(1);
            changedKey[0][0].should.eql('database:connection:filename');
            changedKey[0][1].should.not.eql('content/data/ghost.db');
        });

        it('ensure it skips non strings', function () {
            var changedKey = [],
                obj = {
                    database: {
                        test: 10
                    }
                };

            this.set = function (key, value) {
                changedKey.push([key, value]);
            };

            configUtils.makePathsAbsolute.bind(this)(obj.database, 'database');
            changedKey.length.should.eql(0);
        });

        it('ensure we don\' change absolute paths', function () {
            var changedKey = [],
                obj = {
                    database: {
                        client: 'mysql',
                        connection: {
                            filename: '/content/data/ghost.db'
                        }
                    }
                };

            this.set = function (key, value) {
                changedKey.push([key, value]);
            };

            configUtils.makePathsAbsolute.bind(this)(obj.database, 'database');
            changedKey.length.should.eql(0);
        });

        it('match paths on windows', function () {
            var changedKey = [],
                obj = {
                    database: {
                        filename: 'content\\data\\ghost.db'
                    }
                };

            this.set = function (key, value) {
                changedKey.push([key, value]);
            };

            configUtils.makePathsAbsolute.bind(this)(obj.database, 'database');
            changedKey.length.should.eql(1);
            changedKey[0][0].should.eql('database:filename');
            changedKey[0][1].should.not.eql('content\\data\\ghost.db');
        });
    });
});
