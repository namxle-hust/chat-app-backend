"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
	send: async (qmsg, group_id, user_sent_id) => {
		try {
			let groupMembers = await GroupMemberships.find({
				group_id: group_id,
			});

			console.log(groupMembers);
			await Promise.all(
				groupMembers.map(async (groupMember) => {
					if (groupMember.user_id == user_sent_id) {
						return;
					}

					let queueMessage = JSON.stringify(JSON.parse(qmsg));
					await QueueService.publish(
						groupMember.user_id,
						new Buffer(queueMessage)
					);
				})
			);
			return true;
		} catch (error) {
			throw error;
		}
	},

	boardCastLeaveVideoCallMessage: async (qmsg, group_id) => {
		try {
			let groupMemberShips = await GroupMemberships.find({
				group_id: group_id,
				group_call_status:
					GroupMemberships.GROUP_CALL_STATUSES.IN_A_CALL,
			});

			await Promise.all(
				groupMemberShips.map(async (groupMember) => {
					let userId = groupMember.user_id;
					let socketIds = await UserMappingService.getSocketId(
						userId
					);
					if (socketIds && socketIds.length > 0) {
						socketIds.forEach((sckId) => {
							sails.sockets.broadcast(sckId, "group_leave", qmsg);
						});
					} else {
                        
					}
                    return true;
				})
			);
		} catch (error) {}
	},

	boardCastGroupAnswerMessage: async (qmsg, group_id, user_sent_id) => {
		try {
			let groupMemberShips = await GroupMemberships.find({
				group_id: group_id,
				group_call_status:
					GroupMemberships.GROUP_CALL_STATUSES.IN_A_CALL,
			});

			await GroupMemberships.update(
				{ group_id: group_id, user_id: user_sent_id },
				{
					group_call_status:
						GroupMemberships.GROUP_CALL_STATUSES.IN_A_CALL,
				}
			);

			await Promise.all(
				groupMemberShips.map(async (groupMember) => {
					let userId = groupMember.user_id;
					let socketIds = await UserMappingService.getSocketId(
						userId
					);
					if (socketIds && socketIds.length > 0) {
						socketIds.forEach((sckId) => {
							sails.sockets.broadcast(
								sckId,
								"group_answering",
								qmsg
							);
						});
					} else {
					}
				})
			);
		} catch (error) {
			throw error;
		}
	},

	getInACallUsers: async (group_id) => {
		try {
			let groupMemberShips = await GroupMemberships.find({
				group_id: group_id,
				group_call_status:
					GroupMemberships.GROUP_CALL_STATUSES.IN_A_CALL,
			});

			return groupMemberShips;
		} catch (error) {
			throw error;
		}
	},

	boardCastGroupCallingMessage: async (qmsg, group_id, user_sent_id) => {
		try {
			let groupMemberShips = await GroupMemberships.update(
				{ group_id: group_id },
				{
					group_call_status:
						GroupMemberships.GROUP_CALL_STATUSES.CALLING,
				}
			).fetch();

			let missedCalls = 0;

			await Promise.all(
				groupMemberShips.map(async (groupMember) => {
					let userId = groupMember.user_id;

					if (userId == user_sent_id) {
						// Update the status of the calling one to in a call
						await GroupMemberships.update(
							{ user_id: user_sent_id, group_id: group_id },
							{
								group_call_status:
									GroupMemberships.GROUP_CALL_STATUSES
										.IN_A_CALL,
							}
						);
						return;
					}

					let socketIds = await UserMappingService.getSocketId(
						userId
					);
					if (socketIds && socketIds.length > 0) {
						socketIds.forEach((sckId) => {
							sails.sockets.broadcast(
								sckId,
								"group_calling",
								qmsg
							);
						});
					} else {
						missedCalls += 1;
						await GroupMemberships.update(
							{ user_id: userId, group_id: group_id },
							{
								group_call_status:
									GroupMemberships.GROUP_CALL_STATUSES
										.MISSED_CALL,
							}
						);
					}
				})
			);
			console.log("boardCastGroupCallingMessage");
			console.log(missedCalls);
			console.log(groupMemberShips.length);
			// If no one is online
			if (missedCalls == groupMemberShips.length - 1) {
				await VideoCallService.cancelGroupCall(group_id, qmsg.id);
			}
		} catch (error) {
			throw error;
		}
	},

	updateGroupCallStatus: async (group_id, status) => {
		try {
			await GroupMemberships.update(
				{ group_id: group_id },
				{ group_call_status: status }
			);
		} catch (error) {}
	},
};
