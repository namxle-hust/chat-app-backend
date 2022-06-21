module.exports = {
    missedCall: async (msg_id) => {
        try {
            await CommonService.delay(30000);

            let message = await PrivateChat.findOne({ id: msg_id })

            if (message.message == 'Missed Call' || message.message == 'In a call') {
                return;
            } else {
                await PrivateChat.update({ id: msg_id }, { message: 'Missed Call' })
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
            throw error;
        }
    }
}