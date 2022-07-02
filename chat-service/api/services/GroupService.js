"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
	send: async (qmsg, group_id, user_sent_id) => {
		try {
			let groupMembers = GroupMemberships.find({ group_id: group_id });

			await Promise.all(
				groupMembers.map(async (groupMember) => {
                    if (groupMember.user_id == user_sent_id) {
                        return;
                    }
					let queueMessage = JSON.parse(JSON.stringify(qmsg));
					await QueueService.publish(groupMember.user_id, queueMessage);
				})
			);
			return true;
		} catch (error) {
			throw error;
		}
	},

};
