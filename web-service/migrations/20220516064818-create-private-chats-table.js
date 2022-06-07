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
    db.createTable('private_chat', {
        id: {
			type: 'int',
			primaryKey: true,
			unique: true,
			autoIncrement: true,
			length: 11
		},
        user_sent_id: {
            type: 'int',
            length: 11
        },
        user_recv_id: {
            type: 'int',
            length: 11
        },
        message: {
            type: 'string',
            columnType: 'text'
        },
        createdAt: {
			type: 'timestamp',
			defaultValue: new String('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: 'timestamp',
			defaultValue: new String('CURRENT_TIMESTAMP')
		},
    }, callback)
};

exports.down = function (db, callback) {
    return db.dropTable('private_chat', callback);
};

exports._meta = {
	version: 1,
};
