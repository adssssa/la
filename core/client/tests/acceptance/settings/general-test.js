/* jshint expr:true */
import {
    describe,
    it,
    beforeEach,
    afterEach
} from 'mocha';
import { expect } from 'chai';
import Ember from 'ember';
import startApp from '../../helpers/start-app';
import destroyApp from '../../helpers/destroy-app';
import { invalidateSession, authenticateSession } from 'ghost/tests/helpers/ember-simple-auth';

const {run} = Ember;

describe('Acceptance: Settings - General', function () {
    let application;

    beforeEach(function() {
        application = startApp();
    });

    afterEach(function() {
        destroyApp(application);
    });

    it('redirects to signin when not authenticated', function () {
        invalidateSession(application);
        visit('/settings/general');

        andThen(function() {
            expect(currentURL(), 'currentURL').to.equal('/signin');
        });
    });

    it('redirects to team page when authenticated as author', function () {
        let role = server.create('role', {name: 'Author'});
        let user = server.create('user', {roles: [role], slug: 'test-user'});

        authenticateSession(application);
        visit('/settings/general');

        andThen(() => {
            expect(currentURL(), 'currentURL').to.equal('/team/test-user');
        });
    });

    it('redirects to team page when authenticated as editor', function () {
        let role = server.create('role', {name: 'Editor'});
        let user = server.create('user', {roles: [role], slug: 'test-user'});

        authenticateSession(application);
        visit('/settings/general');

        andThen(() => {
            expect(currentURL(), 'currentURL').to.equal('/team');
        });
    });

    describe('when logged in', function () {
        beforeEach(function () {
            let role = server.create('role', {name: 'Administrator'});
            let user = server.create('user', {roles: [role]});

            server.loadFixtures();

            return authenticateSession(application);
        });

        it('it renders, shows image uploader modals', function () {
            visit('/settings/general');

            andThen(() => {
                // has correct url
                expect(currentURL(), 'currentURL').to.equal('/settings/general');

                // has correct page title
                expect(document.title, 'page title').to.equal('Settings - General - Test Blog');

                // highlights nav menu
                expect($('.gh-nav-settings-general').hasClass('active'), 'highlights nav menu item')
                    .to.be.true;

                expect(find('.view-header .view-actions .btn-blue').text().trim(), 'save button text').to.equal('Save');

                // initial postsPerPage should be 5
                expect(find('input#postsPerPage').val(), 'post per page value').to.equal('5');

                expect(find('input#permalinks').prop('checked'), 'date permalinks checkbox').to.be.false;
            });

            click('.blog-logo');

            andThen(() => {
                expect(find('.fullscreen-modal .modal-content .gh-image-uploader').length, 'modal selector').to.equal(1);
            });

            click('.fullscreen-modal .modal-content .gh-image-uploader .image-cancel');

            andThen(() => {
                expect(find('.fullscreen-modal .modal-content .gh-image-uploader .description').text()).to.equal('Upload an image');
            });

            // click cancel button
            click('.fullscreen-modal .modal-footer .btn.btn-minor');

            andThen(() => {
                expect(find('.fullscreen-modal').length).to.equal(0);
            });

            click('.blog-cover');

            andThen(() => {
                expect(find('.fullscreen-modal .modal-content .gh-image-uploader').length, 'modal selector').to.equal(1);
            });

            click('.fullscreen-modal .modal-footer .js-button-accept');

            andThen(() => {
                expect(find('.fullscreen-modal').length).to.equal(0);
            });

            // renders theme selector correctly
            andThen(() => {
                expect(find('#activeTheme select option').length, 'available themes').to.equal(1);
                expect(find('#activeTheme select option').text().trim()).to.equal('Blog - 1.0');
            });

            // handles private blog settings correctly
            andThen(() => {
                expect(find('input#isPrivate').prop('checked'), 'isPrivate checkbox').to.be.false;
            });

            click('input#isPrivate');

            andThen(() => {
                expect(find('input#isPrivate').prop('checked'), 'isPrivate checkbox').to.be.true;
                expect(find('#settings-general input[name="general[password]"]').length, 'password input').to.equal(1);
                expect(find('#settings-general input[name="general[password]"]').val(), 'password default value').to.not.equal('');
            });

            fillIn('#settings-general input[name="general[password]"]', '');
            click('.view-header .view-actions .btn-blue');

            andThen(() => {
                expect(find('#settings-general .error .response').text().trim(), 'inline validation response')
                    .to.equal('Password must be supplied');
            });

            fillIn('#settings-general input[name="general[password]"]', 'asdfg');
            click('.view-header .view-actions .btn-blue');

            andThen(() => {
                expect(find('#settings-general .error .response').text().trim(), 'inline validation response')
                    .to.equal('');
            });

            // validates a facebook url correctly
            fillIn('#settings-general input[name="general[facebook]"]', 'http://facebook.com/username');
            triggerEvent('#settings-general input[name="general[facebook]"]', 'blur');

            andThen(() => {
                expect(find('#settings-general .response').text().trim(), 'inline validation response')
                    .to.equal('The URL must be in a format like https://www.facebook.com/yourUsername');
            });

            fillIn('#settings-general input[name="general[facebook]"]', 'https://www.facebook.com/username');
            triggerEvent('#settings-general input[name="general[facebook]"]', 'blur');

            andThen(() => {
                expect(find('#settings-general .error .response').text().trim(), 'inline validation response')
                    .to.equal('');
            });

            // validates a twitter url correctly
            fillIn('#settings-general input[name="general[twitter]"]', 'http://twitter.com/username');
            triggerEvent('#settings-general input[name="general[twitter]"]', 'blur');

            andThen(() => {
                expect(find('#settings-general .response').text().trim(), 'inline validation response')
                    .to.equal('The URL must be in a format like https://twitter.com/yourUsername');
            });

            fillIn('#settings-general input[name="general[twitter]"]', 'https://twitter.com/username');
            triggerEvent('#settings-general input[name="general[twitter]"]', 'blur');

            andThen(() => {
                expect(find('#settings-general .response').text().trim(), 'inline validation response')
                    .to.equal('');
            });
        });

    });
});
