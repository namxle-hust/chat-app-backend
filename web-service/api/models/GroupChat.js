/**
 * GroupChat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'group_chat',
    primaryKey: "id",
	attributes: {
		group_id: {
			type: "number"
		},
		user_id: {
			type: "number"
		},
		message_type: {
			type: "string",
		},
		message: {
			type: "string"
		},
        message_time: {
            type: 'ref',
            columnType: "timestamp"
        }, 
        msg_time_total: {
            type: 'number'
        },
        status: {
            type: 'string',
            allowNull: true
        },
	},
};
