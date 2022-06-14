/**
 * GroupMemberships.js
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
	},
};
