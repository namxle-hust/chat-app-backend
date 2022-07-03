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
	db.addColumn("group_chat", "status", { type: "string" }, callback);
	db.addColumn("group_chat", "msg_time_total", { type: "int" }, callback);
};

exports.down = function (db, callback) {
	db.removeColumn("group_chat", "status", callback);
	db.removeColumn("group_chat", "msg_time_total", callback);
};

exports._meta = {
	version: 1,
};
