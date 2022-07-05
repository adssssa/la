const {SafeString} = require('../services/handlebars');
const {config, urlUtils, getFrontendKey, labs} = require('../services/proxy');

async function comments() {
    // todo: For now check on the comment id to exclude normal pages (we probably have a better way to do this)
    const commentId = this.comment_id;

    if (!commentId) {
        return;
    }

    const frontendKey = await getFrontendKey();

    const data = {
        'ghost-comments': urlUtils.getSiteUrl(),
        api: urlUtils.urlFor('api', {type: 'content'}, true),
        admin: urlUtils.urlFor('admin', true),
        key: frontendKey,
        'post-id': this.id,
        'sentry-dsn': '' /* todo: insert sentry dsn key here */
    };

    let dataAttributes = '';

    Object.entries(data).forEach(([key, value]) => {
        dataAttributes += `data-${key}="${value}" `;
    });

    return new SafeString(`
        <script defer src="${config.get('comments:url')}" ${dataAttributes} crossorigin="anonymous"></script>
    `);
}

module.exports = async function commentsLabsWrapper() {
    const self = this;
    const args = arguments;

    return labs.enabledHelper({
        flagKey: 'comments',
        flagName: 'Comments',
        helperName: 'comments'
    }, () => {
        return comments.apply(self, args);
    });
};

module.exports.async = true;
