"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
	send: async (qmsg, group_id, user_sent_id) => {
		try {
			let groupMembers = await GroupMemberships.find({ group_id: group_id });

            console.log(groupMembers);
			await Promise.all(
				groupMembers.map(async (groupMember) => {
                    if (groupMember.user_id == user_sent_id) {
                        return;
                    }

					let queueMessage = JSON.stringify(JSON.parse((qmsg)));
					await QueueService.publish(groupMember.user_id, new Buffer(queueMessage));
				})
			);
			return true;
		} catch (error) {
			throw error;
		}
	},


    
};
