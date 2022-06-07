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
		id: {
			type: "number",
			unique: true,
			autoIncrement: true,
		},
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

