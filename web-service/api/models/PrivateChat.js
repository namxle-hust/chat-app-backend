/**
 * PrivateChat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: "private_chat",
	primaryKey: "id",
	attributes: {
		user_sent_id: {
            type: 'number'
        },
        user_recv_id: {
            type: 'number'
        },
        message: {
            type: 'string',
            columnType: 'text'
        },
        message_time: {
            type: 'ref',
            columnType: "timestamp"
        },
        message_type: {
			type: "string"
		},
		createdAt: {
			type: "ref",
			columnType: "timestamp",
			autoCreatedAt: true,
		},
		updatedAt: {
			type: "ref",
			columnType: "timestamp",
			autoUpdatedAt: true,
		}
	}

}

