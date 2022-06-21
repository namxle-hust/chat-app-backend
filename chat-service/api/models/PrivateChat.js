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
        message_type: {
            type: 'string'
        },
        message: {
            type: 'string',
            columnType: 'text'
        },
        message_time: {
            type: 'ref',
            columnType: "timestamp"
        },
        msg_time_total: {
            type: 'number'
        },
	},


    message_types: [
        'text',
        'icon',
        'image_url',
        'call',
    ]
}


