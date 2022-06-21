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
			    message: message
			}

            let chat = await PrivateChat.create(msg).fetch();

			let qmsg = {
				recv_id: userRecvId,
				send_id: userSendId,
				msg: message,
				msg_type: msgType,
				msg_time: msgTime,
                msg_id: chat.id
			};

            let socketIds = await UserMappingService.getSocketId(userRecvId);
            if (socketIds && socketIds.length > 0) {
                socketIds.forEach(sckId => {
                    sails.sockets.broadcast(sckId, 'calling', qmsg);
                })
            } else {
                await PrivateChat.update({ id: chat.id }, {  message_time: new Date(), message: 'Missed Call' })
            }

		} catch (error) {
			console.log("Error-CallController@call: ", error);
			return ResponseService.error(res);
		}
	},
};
