'use strict';

// jshint unused: false
const _ = require('lodash');
const Promise = require('bluebird');
const should = require('should');
const sinon = require('sinon');
const testUtils = require('../../../utils');
const models = require('../../../../server/models');
const common = require('../../../../server/lib/common');
const UrlService = require('../../../../server/services/url/UrlService');
const sandbox = sinon.sandbox.create();

describe('Unit: services/url/UrlService', function () {
    let knexMock, urlService;

    before(function () {
        models.init();

        // @NOTE: we auto create a singleton - as soon as you require the file, it will listen on events
        require('../../../../server/services/url').reset();
    });

    before(function () {
        knexMock = new testUtils.mocks.knex();
        knexMock.mock();
    });

    afterEach(function () {
        sandbox.restore();
    });

    after(function () {
        knexMock.unmock();
    });

    after(function () {
        sandbox.restore();
    });

    describe('functional: default routing set', function () {
        let routingType1, routingType2, routingType3, routingType4;

        beforeEach(function () {
            urlService = new UrlService();

            routingType1 = {
                getFilter: sandbox.stub(),
                addListener: sandbox.stub(),
                getType: sandbox.stub(),
                getPermalinks: sandbox.stub(),
                toString: function () {
                    return 'post collection';
                }
            };

            routingType2 = {
                getFilter: sandbox.stub(),
                addListener: sandbox.stub(),
                getType: sandbox.stub(),
                getPermalinks: sandbox.stub(),
                toString: function () {
                    return 'authors';
                }
            };

            routingType3 = {
                getFilter: sandbox.stub(),
                addListener: sandbox.stub(),
                getType: sandbox.stub(),
                getPermalinks: sandbox.stub(),
                toString: function () {
                    return 'tags';
                }
            };

            routingType4 = {
                getFilter: sandbox.stub(),
                addListener: sandbox.stub(),
                getType: sandbox.stub(),
                getPermalinks: sandbox.stub(),
                toString: function () {
                    return 'static pages';
                }
            };

            routingType1.getFilter.returns('featured:false');
            routingType1.getType.returns('posts');
            routingType1.getPermalinks.returns({
                getValue: function () {
                    return '/:slug/';
                }
            });

            routingType2.getFilter.returns(false);
            routingType2.getType.returns('users');
            routingType2.getPermalinks.returns({
                getValue: function () {
                    return '/author/:slug/';
                }
            });

            routingType3.getFilter.returns(false);
            routingType3.getType.returns('tags');
            routingType3.getPermalinks.returns({
                getValue: function () {
                    return '/tag/:slug/';
                }
            });

            routingType4.getFilter.returns(false);
            routingType4.getType.returns('pages');
            routingType4.getPermalinks.returns({
                getValue: function () {
                    return '/:slug/';
                }
            });

            common.events.emit('routingType.created', routingType1);
            common.events.emit('routingType.created', routingType2);
            common.events.emit('routingType.created', routingType3);
            common.events.emit('routingType.created', routingType4);

            common.events.emit('db.ready');
        });

        afterEach(function () {
            urlService.reset();
        });

        it('check url generators', function () {
            urlService.urlGenerators.length.should.eql(4);
            urlService.urlGenerators[0].routingType.should.eql(routingType1);
            urlService.urlGenerators[1].routingType.should.eql(routingType2);
            urlService.urlGenerators[2].routingType.should.eql(routingType3);
            urlService.urlGenerators[3].routingType.should.eql(routingType4);
        });

        it('getUrl', function (done) {
            let timeout;

            (function retry() {
                clearTimeout(timeout);

                try {
                    let url = urlService.getUrl(testUtils.DataGenerator.forKnex.posts[0].id);
                    url.should.eql('/html-ipsum/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.posts[1].id);
                    url.should.eql('/ghostly-kitchen-sink/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.posts[2].id);
                    should.not.exist(url);

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.tags[0].id);
                    url.should.eql('/tag/kitchen-sink/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.tags[1].id);
                    url.should.eql('/tag/bacon/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.tags[2].id);
                    url.should.eql('/tag/chorizo/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.tags[3].id);
                    url.should.eql('/tag/pollo/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.tags[4].id);
                    url.should.eql('/tag/injection/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.users[0].id);
                    url.should.eql('/author/joe-bloggs/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.users[1].id);
                    url.should.eql('/author/smith-wellingsworth/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.users[2].id);
                    url.should.eql('/author/jimothy-bogendath/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.users[3].id);
                    url.should.eql('/author/slimer-mcectoplasm/');

                    url = urlService.getUrl(testUtils.DataGenerator.forKnex.users[4].id);
                    url.should.eql('/author/contributor/');

                    done();
                } catch (err) {
                    if (err.code === 'URLSERVICE_NOT_READY') {
                        timeout = setTimeout(retry, 50);
                        return;
                    }

                    done(err);
                }
            })();
        });

        it('getResource', function (done) {
            let timeout;

            (function retry() {
                clearTimeout(timeout);

                try {
                    let resource = urlService.getResource('/html-ipsum/');
                    resource.data.id.should.eql(testUtils.DataGenerator.forKnex.posts[0].id);

                    resource = urlService.getResource('/does-not-exist/');
                    should.not.exist(resource);

                    done();
                } catch (err) {
                    if (err.code === 'URLSERVICE_NOT_READY') {
                        timeout = setTimeout(retry, 50);
                        return;
                    }

                    done(err);
                }
            })();
        });

        it('update resource', function (done) {
            models.Post.edit({featured: true}, {id: testUtils.DataGenerator.forKnex.posts[1].id})
                .then(function (post) {
                    let timeout;

                    (function retry() {
                        clearTimeout(timeout);

                        try {
                            // There is no collection which ownes featured posts.
                            let url = urlService.getUrl(post.id);
                            should.not.exist(url);
                            done();
                        } catch (err) {
                            if (err.code === 'URLSERVICE_NOT_READY') {
                                timeout = setTimeout(retry, 50);
                                return;
                            }

                            done(err);
                        }
                    })();
                });
        });

        it('add new resource', function (done) {
            models.Post.add({
                featured: false,
                page: false,
                status: 'published',
                title: 'Brand New Story!',
                author_id: testUtils.DataGenerator.forKnex.users[4].id
            }).then(function (post) {
                let timeout;

                (function retry() {
                    clearTimeout(timeout);

                    try {
                        let url = urlService.getUrl(post.id);
                        url.should.eql('/brand-new-story/');

                        let resource = urlService.getResource(url);
                        resource.data.primary_author.id.should.eql(testUtils.DataGenerator.forKnex.users[4].id);

                        done();
                    } catch (err) {
                        if (err.code === 'URLSERVICE_NOT_READY') {
                            timeout = setTimeout(retry, 50);
                            return;
                        }

                        done(err);
                    }
                })();
            });
        });
    });
});
