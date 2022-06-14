/**
 * GroupChat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
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
        }
	},
};
