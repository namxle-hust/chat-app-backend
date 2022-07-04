module.exports = {
	missedCall: async (msg_id) => {
		try {
			// Delay 50 secs until
			await CommonService.delay(50000);

			let message = await PrivateChat.findOne({ id: msg_id });

			if (
				message.message == "Missed Call" ||
				message.message == "In a call" ||
				message.message == "Call Ended"
			) {
				return;
			}

			let userRecvId = message.user_recv_id;
			let userSendId = message.user_sent_id;

			await VideoCallService.cancelCall(userRecvId, userSendId, msg_id);

			return;
		} catch (error) {
			throw error;
		}
	},

	cancelCall: async (userRecvId, userSendId, msgId) => {
		try {
			let msgType = "call";
			let msgTime = new Date();

			await PrivateChat.update(
				{ id: msgId },
				{ message: "Missed Call", message_time: msgTime }
			);

			let qmsg = JSON.stringify({
				user_recv_id: userRecvId,
				user_sent_id: userSendId,
				message: "Missed Call",
				message_type: msgType,
				msg_time_total: 0,
				message_time: msgTime,
				id: msgId,
			});

			// Public to chat exchange w/o routing key
			await Promise.all([
				QueueService.publish(userRecvId, new Buffer(qmsg)),
				QueueService.publish(userSendId, new Buffer(qmsg)),
			]);
		} catch (error) {
			throw error;
		}
	},
	groupMissedCall: async (msg_id) => {
		try {
			// Delay 50 secs until
			await CommonService.delay(50000);

			let message = await GroupChat.findOne({ id: msg_id });

			if (
				message.message == "Missed Call" ||
				message.message == "In a call" ||
				message.message == "Call Ended"
			) {
				return;
			}

			let groupId = message.group_id;
			let userSendId = message.user_id;

			// await VideoCallService.cancelCall(userRecvId, userSendId, msg_id);
			await VideoCallService.cancelGroupCall(groupId, message.id);

			return;
		} catch (error) {
			throw error;
		}
	},

	cancelGroupCall: async (group_id, msg_id) => {
		try {
			let msgType = "call";
			let msgTime = new Date();

			let msg = await GroupChat.update(
				{ id: msg_id },
				{ message: "Missed Call", message_time: msgTime }
			).fetch();

			let qmsg = JSON.stringify({
				group_id: group_id,
				user_id: msg[0].user_id,
				message: "Missed Call",
				message_type: msgType,
				message_time: msgTime,
				is_group: true,
				id: msg_id,
			});

            await GroupService.updateGroupCallStatus(group_id, GroupMemberships.GROUP_CALL_STATUSES.NORMAL)
			await GroupService.send(qmsg, group_id, null);

		} catch (error) {
			throw error;
		}
	},
};
