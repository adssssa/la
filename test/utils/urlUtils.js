const _ = require('lodash');
const sinon = require('sinon');
const UrlUtils = require('@tryghost/url-utils');
const configUtils = require('./configUtils');
const config = require('../../core/shared/config');
const urlUtils = require('../../core/shared/url-utils');

const defaultSandbox = sinon.createSandbox();

const getInstance = (options) => {
    const opts = {
        getSubdir: config.getSubdir,
        getSiteUrl: config.getSiteUrl,
        getAdminUrl: config.getAdminUrl,
        apiVersions: options.apiVersions,
        defaultApiVersion: 'canary',
        slugs: options.slugs,
        redirectCacheMaxAge: options.redirectCacheMaxAge,
        baseApiPath: '/ghost/api'
    };

    return new UrlUtils(opts);
};

const stubUrlUtils = (options, sandbox) => {
    const stubInstance = getInstance(options);
    const classPropNames = Object.getOwnPropertyNames(Object.getPrototypeOf(urlUtils))
        .filter(name => name !== 'constructor');

    classPropNames.forEach((key) => {
        if (typeof urlUtils[key] === 'function') {
            sandbox.stub(urlUtils, key).callsFake(function () {
                return stubInstance[key](...arguments);
            });
        } else {
            sandbox.stub(urlUtils, key).get(function () {
                return stubInstance[key];
            });
        }
    });

    return stubInstance;
};

// Method for regressions tests must be used with restore method
const stubUrlUtilsFromConfig = () => {
    const options = {
        apiVersions: config.get('api:versions'),
        defaultApiVersion: 'canary',
        slugs: config.get('slugs').protected,
        redirectCacheMaxAge: config.get('caching:301:maxAge'),
        baseApiPath: '/ghost/api'
    };

    return stubUrlUtils(options, defaultSandbox);
};

const restore = () => {
    defaultSandbox.restore();
    configUtils.restore();
};

module.exports.stubUrlUtilsFromConfig = stubUrlUtilsFromConfig;
module.exports.restore = restore;
module.exports.getInstance = getInstance;
