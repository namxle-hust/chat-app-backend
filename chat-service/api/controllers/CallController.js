/**
 * CallController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
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
				recv_id: userRecvId,
				send_id: userSendId,
				msg: message,
				msg_type: msgType,
				msg_time: msgTime,
				msg_id: chat.id,
			};

			let socketIds = await UserMappingService.getSocketId(userRecvId);
			if (socketIds && socketIds.length > 0) {
				socketIds.forEach((sckId) => {
					sails.sockets.broadcast(sckId, "calling", qmsg);
				});
			} else {
				await PrivateChat.update(
					{ id: chat.id },
					{ message_time: new Date(), message: "Missed Call" }
				);
			}
		} catch (error) {
			console.log("Error-CallController@call: ", error);
			return ResponseService.error(res);
		}
	},

	// Sent from the person who call
	cancelCall: async (req, res) => {
		try {
			if (!req.isSocket) {
				return req.badRequest();
			}

			let data = req.body;
			let userRecvId = data.recvId;
			let userSendId = req.user.id;
			let msgId = data.msgId;

			let msgType = "call";
			let msgTime = new Date();

			let qmsg = JSON.stringify({
				recv_id: userRecvId,
				send_id: userSendId,
				msg: "Missed Call",
				msg_type: msgType,
				msg_time: msgTime,
				msg_id: msgId,
			});

			await PrivateChat.update(
				{ id: msgId },
				{ message: "Missed Call", message_time: msgTime }
			);

			// Public to chat exchange w/o routing key
			await Promise.all([
				await QueueService.publish(userSendId, new Buffer(qmsg)),
				await QueueService.publish(userRecvId, new Buffer(qmsg)),
			]);
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
			let msgId = data.msgId;
			let msgType = "call";

			let chat = await PrivateChat.findOne({ id: msgId });

			let msgTimeTotal = CommonService.dateDiff(chat.message_time);

			let qmsg = JSON.stringify({
				recv_id: chat.user_recv_id,
				send_id: chat.user_sent_id,
				msg: "Call Ended",
				msg_type: msgType,
				msg_time_total: msgTimeTotal,
				msg_id: msgId,
			});

			await Promise.all([
				await PrivateChat.update(
					{ id: msgId },
					{ msg_time_total: msgTimeTotal, message: "Call Ended" }
				),
				await QueueService.publish(chat.user_recv_id, new Buffer(qmsg)),
				await QueueService.publish(chat.user_sent_id, new Buffer(qmsg)),
			]);
		} catch (error) {
			console.log("Error-CallController@finishCall: ", error);
			return ResponseService.error(res);
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
			let msgId = data.msgId;

			let socketIds = await UserMappingService.getSocketId(userRecvId);

			if (response == "accept") {
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

				let msgTime = new Date();

				let qmsg = JSON.stringify({
					recv_id: req.user.id,
					send_id: userRecvId,
					msg: "Missed Call",
					msg_type: "call",
					msg_time: msgTime,
					msg_id: msgId,
				});

				await PrivateChat.update(
					{ id: msgId },
					{ message: "Missed Call", message_time: msgTime }
				);

				// Public to chat exchange w/o routing key
				await Promise.all([
					await QueueService.publish(req.user.id, new Buffer(qmsg)),
					await QueueService.publish(userRecvId, new Buffer(qmsg)),
				]);
			}
		} catch (error) {
			console.log("Error-CallController@accept: ", error);
			return ResponseService.error(res);
		}
	},
};
