const {DateTime} = require('luxon');

class MembersStatsService {
    constructor({db}) {
        this.db = db;
    }

    /**
     * Get the current total subscriptions grouped by Cadence and Tier
     * @returns {Promise<TotalSubscriptionStats>}
     **/
    async getSubscriptionCount() {
        const knex = this.db.knex;

        const data = await knex('members_stripe_customers_subscriptions')
            .select(knex.raw(`
                 COUNT(members_stripe_customers_subscriptions.id) AS count,
                 products.id AS tier,
                 stripe_prices.interval AS cadence
            `))
            .join('stripe_prices', 'stripe_prices.stripe_price_id', '=', 'members_stripe_customers_subscriptions.stripe_price_id')
            .join('stripe_products', 'stripe_products.stripe_product_id', '=', 'stripe_prices.stripe_product_id')
            .join('products', 'products.id', '=', 'stripe_products.product_id')
            .groupBy('tier', 'cadence');

        return {
            data: data,
            meta: {
                tiers: data.reduce((tiers, row) => {
                    if (tiers.includes(row.tier)) {
                        return tiers;
                    }
                    return tiers.concat(row.tier);
                }, [])
            }
        };
    }

    /**
     * Get the current total members grouped by status
     * @returns {Promise<TotalMembersByStatus>}
     */
    async getCount() {
        const knex = this.db.knex;
        const rows = await knex('members')
            .select('status')
            .select(knex.raw('COUNT(id) AS total'))
            .groupBy('status');
        
        const paidEvent = rows.find(c => c.status === 'paid');
        const freeEvent = rows.find(c => c.status === 'free');
        const compedEvent = rows.find(c => c.status === 'comped');

        return {
            paid: paidEvent ? paidEvent.total : 0,
            free: freeEvent ? freeEvent.total : 0,
            comped: compedEvent ? compedEvent.total : 0
        };
    }

    /**
     * Get the member deltas by status for all days, sorted ascending
     * @returns {Promise<MemberStatusDelta[]>} The deltas of paid, free and comped users per day, sorted ascending
     */
    async fetchAllStatusDeltas() {
        const knex = this.db.knex;
        const rows = await knex('members_status_events')
            .select(knex.raw('DATE(created_at) as date'))
            .select(knex.raw(`SUM(
                CASE WHEN to_status='paid' THEN 1
                ELSE 0 END
            ) as paid_subscribed`))
            .select(knex.raw(`SUM(
                CASE WHEN from_status='paid' THEN 1
                ELSE 0 END
            ) as paid_canceled`))
            .select(knex.raw(`SUM(
                CASE WHEN to_status='comped' THEN 1
                WHEN from_status='comped' THEN -1
                ELSE 0 END
            ) as comped_delta`))
            .select(knex.raw(`SUM(
                CASE WHEN to_status='free' THEN 1
                WHEN from_status='free' THEN -1
                ELSE 0 END
            ) as free_delta`))
            .groupByRaw('DATE(created_at)')
            .orderByRaw('DATE(created_at)');
        return rows;
    }

    /**
     * Returns a list of the total members by status for each day, including the paid deltas paid_subscribed and paid_canceled
     * @returns {Promise<CountHistory>}
     */
    async getCountHistory() {
        const rows = await this.fetchAllStatusDeltas();

        // Fetch current total amounts and start counting from there
        const totals = await this.getCount();
        let {paid, free, comped} = totals;

        // Get today in UTC (default timezone)
        const today = DateTime.now().toISODate();

        const cumulativeResults = [];

        // Loop in reverse order (needed to have correct sorted result)
        for (let i = rows.length - 1; i >= 0; i -= 1) {
            const row = rows[i];

            // Convert JSDates to YYYY-MM-DD (in UTC)
            const date = DateTime.fromJSDate(row.date).toISODate();
            if (date > today) {
                // Skip results that are in the future (fix for invalid events)
                continue;
            }
            cumulativeResults.unshift({
                date,
                paid: Math.max(0, paid),
                free: Math.max(0, free),
                comped: Math.max(0, comped),

                // Deltas
                paid_subscribed: row.paid_subscribed,
                paid_canceled: row.paid_canceled
            });

            // Update current counts
            paid -= row.paid_subscribed - row.paid_canceled;
            free -= row.free_delta;
            comped -= row.comped_delta;
        }

        // Now also add the oldest day we have left over (this one will be zero, which is also needed as a data point for graphs)
        const oldestDate = rows.length > 0 ? DateTime.fromJSDate(rows[0].date).minus({days: 1}).toISODate() : today;

        cumulativeResults.unshift({
            date: oldestDate,
            paid: Math.max(0, paid),
            free: Math.max(0, free),
            comped: Math.max(0, comped),

            // Deltas
            paid_subscribed: 0,
            paid_canceled: 0
        });

        return {
            data: cumulativeResults,
            meta: {
                totals
            }
        };
    }
}

module.exports = MembersStatsService;

/**
 * @typedef MemberStatusDelta
 * @type {Object}
 * @property {Date} date
 * @property {number} paid_subscribed Paid members that subscribed on this day
 * @property {number} paid_canceled Paid members that canceled on this day
 * @property {number} comped_delta Total net comped members on this day
 * @property {number} free_delta Total net members on this day
 */

/**
 * @typedef TotalMembersByStatus
 * @type {Object}
 * @property {number} paid Total paid members
 * @property {number} free Total free members
 * @property {number} comped Total comped members
 */

/**
 * @typedef {Object} TotalMembersByStatusItem
 * @property {string} date In YYYY-MM-DD format
 * @property {number} paid Total paid members
 * @property {number} free Total free members
 * @property {number} comped Total comped members
 * @property {number} paid_subscribed Paid members that subscribed on this day
 * @property {number} paid_canceled Paid members that canceled on this day
 */

/**
 * @typedef {Object} CountHistory
 * @property {TotalMembersByStatusItem[]} data List of the total members by status for each day, including the paid deltas paid_subscribed and paid_canceled
 * @property {Object} meta
 */

/**
 * @typedef {object} SubscriptionCount
 * @prop {number} count
 * @prop {'year' | 'month' | 'week' | 'day'} cadence
 * @prop {string} tier The ID of a Tier
 **/

/**
 * @typedef {object} TotalSubscriptionStats
 * @prop {SubscriptionCount[]} data
 * @prop {object} meta
 * @prop {string[]} meta.tiers A list of the Tier IDs present in the dataset
 **/
