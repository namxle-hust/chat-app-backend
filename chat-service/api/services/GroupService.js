"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
	send: async (qmsg, group_id) => {
		try {
			let users = Groups.find({ id: group_id });

			await Promise.all(
				users.map(async (user) => {
					let queueMessage = JSON.parse(JSON.stringify(qmsg));
					queueMessage.recv_id = user.id;

					await QueueService.publish(user.id, queueMessage);
				})
			);
			return true;
		} catch (error) {
			throw error;
		}
	},
};
