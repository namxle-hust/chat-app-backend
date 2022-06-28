/**
 * CallController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getUserInformation: async (req, res) => {
        try {
            if (!req.isSocket) {
				return req.badRequest();
			}

            let userId = req.body.user_id;

            let user = await Users.findOne({ id: userId });

            let data = {
                user: user
            }
            
            return ResponseService.success(res, data);

        } catch (error) {
            console.log("Error-CallController@getUserInformation: ", error);
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
			let userRecvId = data.recvId;
			let userSendId = req.user.id;
			let msgType = "call";
			let msgTime = new Date();

			// Save message to the database
			let msg = {
				user_sent_id: userSendId,
				user_recv_id: userRecvId,
				message_type: msgType,
				message_time: msgTime,
				message: message,
			};

			let chat = await PrivateChat.create(msg).fetch();

            let qmsg = {
                user_recv_id: userRecvId,
                user_sent_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                msg_time_total: 0,
                id: chat.id
            }

            ResponseService.success(res, { call_id: chat.id });

			let socketIds = await UserMappingService.getSocketId(userRecvId);
			if (socketIds && socketIds.length > 0) {
				socketIds.forEach((sckId) => {
					sails.sockets.broadcast(sckId, "calling", qmsg);
				});
			} else {
				await VideoCallService.cancelCall(userRecvId, userSendId, chat.id);
                return;
			}

            // ResponseService.success(res);
			await VideoCallService.missedCall(chat.id);

			
		} catch (error) {
			console.log("Error-CallController@call: ", error);
			// return ResponseService.error(res);
		}
	},

	// Sent from the person who call
	cancelCall: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;
			let userSendId = req.user.id;
			let msgId = data.msg_id;

			let message = await PrivateChat.findOne({ id: msgId });

			if (message.message == "Missed Call") {
				return;
				// return ResponseService.success(res);
			}

			await VideoCallService.cancelCall(message.user_recv_id, userSendId, msgId);

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

			let chat = await PrivateChat.findOne({ id: msgId });

			let msgTimeTotal = CommonService.dateDiff(chat.message_time);

			let qmsg = JSON.stringify({
				user_recv_id: chat.user_recv_id,
				user_sent_id: chat.user_sent_id,
				message: "Call Ended",
                message_time: new Date(),
				message_type: msgType,
				msg_time_total: msgTimeTotal,
				id: msgId,
			});

			await Promise.all([
				PrivateChat.update(
					{ id: msgId },
					{ msg_time_total: msgTimeTotal, message: "Call Ended" }
				),
				QueueService.publish(chat.user_recv_id, new Buffer(qmsg)),
				QueueService.publish(chat.user_sent_id, new Buffer(qmsg)),
			]);
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
			let userRecvId = data.user_recv_id;
			let response = data.response;
			let msgId = data.msg_id;

			let socketIds = await UserMappingService.getSocketId(userRecvId);

			if (response == "accept") {
				let message = await PrivateChat.findOne({ id: msgId });

				if (message.message == "Missed Call") {
                    return;
                    // return ResponseService.success(res); 
				}

                await PrivateChat.update({ id: msgId }, { message: 'In a call' });

				let msg = {
					data: {
						user_sent_id: req.user.id,
						peer_id: peerId,
						msg_id: msgId,
					},
				};

				// Send the one who call that the call have been accepted with peer id
				socketIds.forEach((sckId) => {
					sails.sockets.broadcast(sckId, "answerCall", msg);
				});
			} else {
				// The call have been rejected

				await VideoCallService.cancelCall(req.user.id, userRecvId, msgId);

			}
			return ResponseService.success(res);
		} catch (error) {
			console.log("Error-CallController@accept: ", error);
			// return ResponseService.error(res);
		}
	},
};
