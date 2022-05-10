const ObjectId = require('bson-objectid').default;
const logging = require('@tryghost/logging');
const errors = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');

const {createTransactionalMigration, combineTransactionalMigrations} = require('./migrations');
const {MIGRATION_USER} = require('./constants');

const messages = {
    permissionRoleActionError: 'Cannot {action} permission({permission}) with role({role}) - {resource} does not exist'
};

/**
 * Creates a migration which will add a permission to the database
 *
 * @param {Object} config
 * @param {string} config.name - The name of the permission
 * @param {string} config.action - The action_type of the permission
 * @param {string} config.object - The object_type of the permission
 *
 * @returns {Migration}
 */
function addPermission(config) {
    return createTransactionalMigration(
        async function up(connection) {
            const existingPermission = await connection('permissions').where({
                name: config.name,
                action_type: config.action,
                object_type: config.object
            }).first();

            if (existingPermission) {
                logging.warn(`Permission for ${config.action}:${config.object} already added`);
                return;
            }

            logging.info(`Adding permission for ${config.action}:${config.object}`);

            const date = connection.raw('CURRENT_TIMESTAMP');

            await connection('permissions').insert({
                id: ObjectId().toHexString(),
                name: config.name,
                action_type: config.action,
                object_type: config.object,
                created_at: date,
                created_by: MIGRATION_USER,
                updated_at: date,
                updated_by: MIGRATION_USER
            });
        },
        async function down(connection) {
            const existingPermission = await connection('permissions').where({
                name: config.name,
                action_type: config.action,
                object_type: config.object
            }).first();

            if (!existingPermission) {
                logging.warn(`Permission for ${config.action}:${config.object} already removed`);
                return;
            }

            logging.info(`Removing permission for ${config.action}:${config.object}`);

            await connection('permissions').where({
                action_type: config.action,
                object_type: config.object
            }).del();
        }
    );
}

/**
 * Creates a migration which will link a permission to a role in the database
 *
 * @param {Object} config
 * @param {string} config.permission - The name of the permission
 * @param {string} config.role - The name of the role
 *
 * @returns {Migration}
 */
function addPermissionToRole(config) {
    return createTransactionalMigration(
        async function up(connection) {
            const permission = await connection('permissions').where({
                name: config.permission
            }).first();

            if (!permission) {
                throw new errors.InternalServerError({
                    message: tpl(messages.permissionRoleActionError, {
                        action: 'add',
                        permission: config.permission,
                        role: config.role,
                        resource: 'permission'
                    })
                });
            }

            const role = await connection('roles').where({
                name: config.role
            }).first();

            if (!role) {
                throw new errors.InternalServerError({
                    message: tpl(messages.permissionRoleActionError, {
                        action: 'add',
                        permission: config.permission,
                        role: config.role,
                        resource: 'role'
                    })
                });
            }

            const existingRelation = await connection('permissions_roles').where({
                permission_id: permission.id,
                role_id: role.id
            }).first();

            if (existingRelation) {
                logging.warn(`Adding permission(${config.permission}) to role(${config.role}) - already exists`);
                return;
            }

            logging.info(`Adding permission(${config.permission}) to role(${config.role})`);
            await connection('permissions_roles').insert({
                id: ObjectId().toHexString(),
                permission_id: permission.id,
                role_id: role.id
            });
        },
        async function down(connection) {
            const permission = await connection('permissions').where({
                name: config.permission
            }).first();

            if (!permission) {
                logging.warn(`Removing permission(${config.permission}) from role(${config.role}) - Permission not found.`);
                return;
            }

            const role = await connection('roles').where({
                name: config.role
            }).first();

            if (!role) {
                logging.warn(`Removing permission(${config.permission}) from role(${config.role}) - Role not found.`);
                return;
            }

            const existingRelation = await connection('permissions_roles').where({
                permission_id: permission.id,
                role_id: role.id
            }).first();

            if (!existingRelation) {
                logging.warn(`Removing permission(${config.permission}) from role(${config.role}) - already removed`);
                return;
            }

            logging.info(`Removing permission(${config.permission}) from role(${config.role})`);
            await connection('permissions_roles').where({
                permission_id: permission.id,
                role_id: role.id
            }).del();
        }
    );
}

/**
 * Creates a migration which will add a permission to the database, and then link it to roles
 *
 * @param {Object} config
 * @param {string} config.name - The name of the permission
 * @param {string} config.action - The action_type of the permission
 * @param {string} config.object - The object_type of the permission
 *
 * @param {string[]} roles - A list of role names
 *
 * @returns {Migration}
 */
function addPermissionWithRoles(config, roles) {
    return combineTransactionalMigrations(
        addPermission(config),
        ...roles.map((role => addPermissionToRole({permission: config.name, role})))
    );
}

module.exports = {
    addPermission,
    addPermissionToRole,
    addPermissionWithRoles
};

/**
 * @typedef {Object} TransactionalMigrationFunctionOptions
 *
 * @prop {import('knex').Knex} transacting
 */

/**
 * @typedef {(options: TransactionalMigrationFunctionOptions) => Promise<void>} TransactionalMigrationFunction
 */

/**
 * @typedef {Object} Migration
 *
 * @prop {Object} config
 * @prop {boolean} config.transaction
 *
 * @prop {TransactionalMigrationFunction} up
 * @prop {TransactionalMigrationFunction} down
 */
