"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

exports.up = function (db, callback) {
	db.createTable(
		"groups",
		{
			id: {
				type: "int",
				primaryKey: true,
				unique: true,
				autoIncrement: true,
				length: 11,
			},
			user_id: {
				type: "int",
				length: 11,
			},
			createdAt: {
				type: "timestamp",
				defaultValue: new String("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: "timestamp",
				defaultValue: new String("CURRENT_TIMESTAMP"),
			},
		},
		callback
	);
};

exports.down = function (db, callback) {
    return db.dropTable('groups', callback);
};

exports._meta = {
	version: 1,
};
