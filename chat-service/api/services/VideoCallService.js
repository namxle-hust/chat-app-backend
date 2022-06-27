module.exports = {
    missedCall: async (msg_id) => {
        try {
            // Delay 50 secs until
            await CommonService.delay(50000);

            let message = await PrivateChat.findOne({ id: msg_id })

            if (message.message == 'Missed Call' || message.message == 'In a call' || message.message == 'Call Ended') {
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
    }
}