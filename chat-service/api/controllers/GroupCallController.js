/**
 * CallController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getGroupInformation: async (req, res) => {
        try {
            if (!req.isSocket) {
				return req.badRequest();
			}

            let groupId = req.body.group_id;

            let group = await Groups.findOne({ id: groupId });

            let data = {
                group: group
            }
            
            return ResponseService.success(res, data);

        } catch (error) {
            console.log("Error-GroupCallController@getGroupInformation: ", error);
			return ResponseService.error(res);
        }
    },

	// Sent from the one who received call

	call: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;

			let message = "Calling";
			let groupId = data.recvId;
			let userSendId = req.user.id;
			let msgType = "call";
			let msgTime = new Date();

			// Save message to the database
			let msg = {
				user_id: userSendId,
				group_id: groupId,
				message_type: msgType,
				message_time: msgTime,
				message: message,
			};

			let chat = await GroupChat.create(msg).fetch();

            let qmsg = {
                user_sent_id: userSendId,
                group_id: groupId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                msg_time_total: 0,
                id: chat.id
            }

            ResponseService.success(res, { call_id: chat.id });

            await GroupService.boardCastGroupCallingMessage(qmsg, groupId, userSendId)

            // ResponseService.success(res);
			await VideoCallService.groupMissedCall(chat.id);

			
		} catch (error) {
			console.log("Error-CallController@call: ", error);
			// return ResponseService.error(res);
		}
	},

	// Sent from the person who call
	cancelGroupCall: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;
			let userSendId = req.user.id;
			let msgId = data.msg_id;

			let message = await GroupChat.findOne({ id: msgId });

			if (message.message == "Missed Call") {
				return;
				// return ResponseService.success(res);
			}

			await VideoCallService.cancelGroupCall(message.group_id, msgId);

			return ResponseService.success(res);
		} catch (error) {
			console.log("Error-CallController@cancelCall: ", error);
			return ResponseService.error(res);
		}
	},

	finishCall: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;
			let msgId = data.msg_id;
			let msgType = "call";

            let userSendId = req.user.id;

			let chat = await GroupChat.findOne({ id: msgId });

            let groupId = chat.group_id;

            await GroupMemberships.update({ user_id: req.user.id, group_id: groupId }, { group_call_status: GroupMemberships.GROUP_CALL_STATUSES.NORMAL });

            let users = await GroupService.getInACallUsers(groupId);

            // The last person finish the call in 1v1 call
            if (!users || (users && users.length == 1)) {
                let msgTimeTotal = CommonService.dateDiff(chat.message_time);

                let qmsg = JSON.stringify({
                    group_id: groupId,
                    user_id: chat.user_id,
                    message: "Call Ended",
                    message_type: msgType,
                    message_time: new Date(),
                    msg_time_total: msgTimeTotal,
                    is_group: true,
                    id: msgId
                })
               
                await GroupService.send(qmsg, groupId, userSendId);

            } else {
                let msg = {
					data: {
						user_leave_id: req.user.id,
						msg_id: msgId,
					},
				};

                await GroupService.boardCastLeaveVideoCallMessage(msg, groupId)
            }

            return ResponseService.success(res);

		} catch (error) {
			console.log("Error-CallController@finishCall: ", error);
			// return ResponseService.error(res);
		}
	},
	answer: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;

			let peerId = data.peer_id;
			let groupId = data.group_id;
			let response = data.response;
			let msgId = data.msg_id;

			if (response == "accept") {
				let message = await GroupChat.findOne({ id: msgId });

				if (message.message == "Missed Call") {
                    return;
                    // return ResponseService.success(res); 
				}

                await GroupChat.update({ id: msgId }, { message: 'In a call' });

				let msg = {
					data: {
						user_sent_id: req.user.id,
						peer_id: peerId,
						msg_id: msgId,
					},
				};

				// Send to every one in a call with peer id
                await GroupService.boardCastGroupAnswerMessage(msg, groupId, req.user.id)

			} else {
				// The call have been rejected by this person

                await GroupMemberships.update({ group_id: groupId, user_id: req.user.id }, { group_call_status: GroupMemberships.GROUP_CALL_STATUSES.MISSED_CALL }) 

			}
			return ResponseService.success(res);
		} catch (error) {
			console.log("Error-CallController@accept: ", error);
			// return ResponseService.error(res);
		}
	},
};
