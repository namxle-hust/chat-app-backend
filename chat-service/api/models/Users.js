/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "users",
	primaryKey: "id",
	attributes: {
		id: {
			type: "number",
			unique: true,
			autoIncrement: true,
		},
		first_name: {
			type: "string",
		},
		last_name: {
			type: "string",
		},
		email: {
			type: "string",
		},
		password: {
			type: 'string',
			maxLength: 255
		},
		profile_pic_url: {
			type: 'string',
            allowNull: true
		},
		status: {
			type: "number",
			defaultsTo: 0,
		},
		last_online_time: {
			type: "ref",
			columnType: "timestamp"
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
	},


    getUserQueueKey: (id) => {
        return `ksuser_${id}`;
    },

    getUserQueueName: (id) => {
        return `queue_user_${id}`
    },

    getUserConsumerTag: (id) => {
        return `consumer_user_tag_${id}`
    },
};
