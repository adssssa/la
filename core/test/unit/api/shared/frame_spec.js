const should = require('should');
const shared = require('../../../../server/api/shared');

describe('Unit: api/shared/frame', function () {
    it('constructor', function () {
        const frame = new shared.Frame();
        Object.keys(frame).should.eql([
            'original',
            'options',
            'data',
            'user',
            'file',
            'files',
            'apiType'
        ]);
    });

    describe('fn: configure', function () {
        it('no transform', function () {
            const original = {
                context: {user: 'id'},
                body: {posts: []},
                params: {id: 'id'},
                query: {include: 'tags', filter: 'page:false', soup: 'yumyum'}
            };

            const frame = new shared.Frame(original);

            frame.configure({});

            should.exist(frame.options.context.user);
            should.not.exist(frame.options.include);
            should.not.exist(frame.options.filter);
            should.not.exist(frame.options.id);
            should.not.exist(frame.options.soup);

            should.exist(frame.data.posts);
        });

        it('transform (context, body, params, query)', function () {
            const original = {
                context: {user: 'id'},
                body: {posts: []},
                params: {id: 'id'},
                query: {include: 'tags', filter: 'page:false', soup: 'yumyum'}
            };

            const frame = new shared.Frame(original);

            frame.configure({
                options: ['include', 'filter', 'id']
            });

            should.exist(frame.options.context.user);
            should.exist(frame.options.include);
            should.exist(frame.options.filter);
            should.exist(frame.options.id);
            should.not.exist(frame.options.soup);

            should.exist(frame.data.posts);
        });

        it('transform (context, options)', function () {
            const original = {
                context: {user: 'id'},
                options: {
                    slug: 'slug'
                }
            };

            const frame = new shared.Frame(original);

            frame.configure({
                options: ['include', 'filter', 'slug']
            });

            should.exist(frame.options.context.user);
            should.exist(frame.options.slug);
        });

        it('transform (context, options, body)', function () {
            const original = {
                context: {user: 'id'},
                options: {
                    id: 'id'
                },
                body: {}
            };

            const frame = new shared.Frame(original);

            frame.configure({
                data: ['id']
            });

            should.exist(frame.options.context.user);
            should.not.exist(frame.options.id);
            should.exist(frame.data.id);
        });
    });
});
