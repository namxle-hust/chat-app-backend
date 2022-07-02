/**
 * GroupMemberships.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    primaryKey: "id",
    tableName: "group_memberships",
	attributes: {
		group_id: {
			type: "number"
		},
		user_id: {
			type: "number"
		},
        group_call_status: {
            type: "string",
            allowNull: true
        }
	},

    GROUP_CALL_STATUSES: {
        IN_A_CALL: 'in a call',
        MISSED_CALL: 'missed call',
        NORMAL: 'normal'
    }
};
