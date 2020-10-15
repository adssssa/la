/**
 * Stats
 * A collection of utilities for handling stats of the site
 */
const debug = require('ghost-ignition').debug('stats');
const moment = require('moment');
const models = require('../models');
const {events} = require('../lib/common');

const stats = {};
let siteCreatedAt;

async function getOldestPostCreatedDate() {
    return models.Post.query(qb => qb.orderBy('created_at', 'ASC').limit(1)).fetchAll({columns: ['created_at']});
}

module.exports = {
    async init() {
        await this.updateMembers();
        await this.updatePosts();
        await this.updateSiteCreatedDate();

        debug('Current stats', this.getAll());

        // Set up events
        const postEvents = ['post.published', 'post.unpublished', 'post.deleted'];

        postEvents.forEach((event) => {
            events.on(event, async () => {
                await this.updatePosts();
                events.emit('updateGlobalTemplateOptions');
            });
        });

        const memberEvents = ['member.added', 'member.deleted', 'member.edited'];

        memberEvents.forEach((event) => {
            events.on(event, async () => {
                await this.updateMembers();
                events.emit('updateGlobalTemplateOptions');
            });
        });
    },

    async updateMembers() {
        stats.total_members = await models.Member.count();
    },

    async updatePosts() {
        stats.total_posts = await models.Post.count();
        stats.total_members_posts = await models.Post.where('visibility', 'member').count();
        stats.total_paid_members_posts = await models.Post.where('visibility', 'paid').count();
        stats.total_tags = await models.Tag.count();
        stats.total_authors = await models.Author.count();
    },

    async updateSiteCreatedDate() {
        const result = await getOldestPostCreatedDate();
        siteCreatedAt = result.models[0].get('created_at');
    },

    get(key) {
        return stats[key];
    },

    getAll() {
        return Object.assign({}, stats, {
            site_age: Date.now() - siteCreatedAt,
            site_age_years: moment(Date.now()).diff(siteCreatedAt, 'years')
        });
    }
};
