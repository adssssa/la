var should = require('should'),
    testUtils = require('../../utils'),
    rewire = require('rewire'),
    configUtils = require('../../utils/configUtils'),

    // Stuff we are testing
    ConfigurationAPI = rewire('../../../server/api/configuration');

describe('Configuration API', function () {
    // Keep the DB clean
    before(testUtils.teardown);
    beforeEach(testUtils.setup('clients'));
    afterEach(function () {
        configUtils.restore();
        return testUtils.teardown();
    });

    should.exist(ConfigurationAPI);

    it('can read basic config and get all expected properties', function (done) {
        configUtils.set('auth:type', 'ghost');
        configUtils.set('auth:url', 'https://auth.ghost.com');

        ConfigurationAPI.read().then(function (response) {
            var props;

            should.exist(response);
            should.exist(response.configuration);
            response.configuration.should.be.an.Array().with.lengthOf(1);
            props = response.configuration[0];

            props.blogUrl.should.eql('http://127.0.0.1:2369/');
            props.routeKeywords.should.eql({
                tag: 'tag',
                author: 'author',
                page: 'page',
                preview: 'p',
                primaryTagFallback: 'all',
                private: 'private',
                subscribe: 'subscribe',
                amp: 'amp'
            });

            props.useGravatar.should.eql(false);
            props.publicAPI.should.eql(false);
            props.clientId.should.eql('ghost-admin');
            props.clientSecret.should.eql('not_available');
            props.ghostAuthUrl.should.eql('https://auth.ghost.com');

            // value not available, because settings API was not called yet
            props.hasOwnProperty('blogTitle').should.eql(true);

            // uuid
            props.hasOwnProperty('ghostAuthId').should.eql(true);

            done();
        }).catch(done);
    });

    it('can read about config and get all expected properties', function (done) {
        ConfigurationAPI.read({key: 'about'}).then(function (response) {
            var props;

            should.exist(response);
            should.exist(response.configuration);
            response.configuration.should.be.an.Array().with.lengthOf(1);
            props = response.configuration[0];

            // Check the structure
            props.should.have.property('version').which.is.a.String();
            props.should.have.property('environment').which.is.a.String();
            props.should.have.property('database').which.is.a.String();
            props.should.have.property('mail').which.is.a.String();

            // Check a few values
            props.environment.should.match(/^testing/);
            props.version.should.eql(require('../../../../package.json').version);

            done();
        }).catch(done);
    });

    it('can read private config and get all expected properties', function (done) {
        ConfigurationAPI.read({key: 'private'}).then(function (response) {
            var props;

            should.exist(response);
            should.exist(response.configuration);
            response.configuration.should.be.an.Array().with.lengthOf(1);
            props = response.configuration[0];

            // value not available, because settings API was not called yet
            props.hasOwnProperty('unsplashApi').should.eql(false);

            done();
        }).catch(done);
    });
});
