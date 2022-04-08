const {createAddColumnMigration} = require('../../utils');

module.exports = createAddColumnMigration('members_paid_subscription_events', 'subscription_id', {
    type: 'string',
    maxlength: 24,
    nullable: true,
    references: 'members_stripe_customers_subscriptions.id',
    cascadeDelete: true
});
