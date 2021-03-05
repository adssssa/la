const sinon = require('sinon');
const should = require('should');

// Stuff we are testing
const helpers = require('../../../core/frontend/helpers');

// TODO: This should probably be from the proxy
const themeI18n = require('../../../core/frontend/services/themes/i18n');
const settingsCache = require('../../../core/server/services/settings/cache');

const moment = require('moment-timezone');

describe('{{date}} helper', function () {
    afterEach(function () {
        settingsCache.reset();
        themeI18n._loadLocale();
    });

    it('creates properly formatted date strings', function () {
        const testDates = [
            '2013-12-31T11:28:58.593+02:00',
            '2014-01-01T01:28:58.593+11:00',
            '2014-02-20T01:28:58.593-04:00',
            '2014-03-01T01:28:58.593+00:00'
        ];

        const timezones = 'Europe/Dublin';
        const format = 'MMM Do, YYYY';

        const context = {
            hash: {
                format: format
            },
            data: {
                site: {
                    timezone: 'Europe/Dublin'
                }
            }
        };

        let rendered;

        testDates.forEach(function (d) {
            rendered = helpers.date.call({published_at: d}, context);

            should.exist(rendered);
            String(rendered).should.equal(moment(d).tz(timezones).format(format));

            rendered = helpers.date.call({}, d, context);

            should.exist(rendered);
            String(rendered).should.equal(moment(d).tz(timezones).format(format));
        });

        // No date falls back to now
        rendered = helpers.date.call({}, context);
        should.exist(rendered);
        String(rendered).should.equal(moment().tz(timezones).format(format));
    });

    it('creates properly localised date strings', function () {
        const testDates = [
            '2013-12-31T23:58:58.593+02:00',
            '2014-01-01T00:28:58.593+11:00',
            '2014-11-20T01:28:58.593-04:00',
            '2014-03-01T01:28:58.593+00:00'
        ];

        const locales = [
            'en',
            'en-gb',
            'de'
        ];

        const timezones = 'Europe/Dublin';
        const format = 'll';

        const context = {
            hash: {},
            data: {
                site: {
                    timezone: 'Europe/Dublin'
                }
            }
        };

        locales.forEach(function (l) {
            settingsCache.set('lang', {value: l});
            themeI18n._loadLocale();
            let rendered;

            testDates.forEach(function (d) {
                rendered = helpers.date.call({published_at: d}, context);

                should.exist(rendered);
                String(rendered).should.equal(moment(d).tz(timezones).locale(l).format(format));

                rendered = helpers.date.call({}, d, context);

                should.exist(rendered);
                String(rendered).should.equal(moment(d).tz(timezones).locale(l).format(format));
            });

            // No date falls back to now
            rendered = helpers.date.call({}, context);
            should.exist(rendered);
            String(rendered).should.equal(moment().tz(timezones).locale(l).format(format));
        });
    });

    it('creates properly formatted time ago date strings', function () {
        const testDates = [
            '2013-12-31T23:58:58.593+02:00',
            '2014-01-01T00:28:58.593+11:00',
            '2014-11-20T01:28:58.593-04:00',
            '2014-03-01T01:28:58.593+00:00'
        ];

        const timezones = 'Europe/Dublin';
        const timeNow = moment().tz('Europe/Dublin');

        const context = {
            hash: {
                timeago: true
            },
            data: {
                site: {
                    timezone: 'Europe/Dublin'
                }
            }
        };

        let rendered;

        testDates.forEach(function (d) {
            rendered = helpers.date.call({published_at: d}, context);

            should.exist(rendered);
            String(rendered).should.equal(moment(d).tz(timezones).from(timeNow));

            rendered = helpers.date.call({}, d, context);

            should.exist(rendered);
            String(rendered).should.equal(moment(d).tz(timezones).from(timeNow));
        });

        // No date falls back to now
        rendered = helpers.date.call({}, context);
        should.exist(rendered);
        String(rendered).should.equal('a few seconds ago');
    });
});
