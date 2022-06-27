/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	healthCheck: async (req, res) => {
		try {
			return res.json({ status: "success", message: "healthy" });
		} catch (error) {
			console.log("Error-TestController@healthCheck: ", error);
			return res.json({ status: "error", message: "error" });
		}
	},

	testSendMessage: async (req, res) => {
		try {
            let data = req.body

            let message = data.message;
            let userRecvId = data.recvId;
            let userSendId = data.id;
            let msgType = data.msg_type
            let msgTime = new Date();

            let qmsg = JSON.stringify({
                recv_id: userRecvId,
                send_id: userSendId,
                msg: message,
                msg_type: msgType,
                msg_time: msgTime
            })
            
            // Save message to the database
            let msg = {
                user_sent_id: userSendId,
                user_recv_id: userRecvId,
                message_type: msgType,
                message_time: msgTime,
                message: message
            }

            await PrivateChat.create(msg);

            // Public to chat exchange w/o routing key
            await QueueService.publish(userRecvId ,new Buffer(qmsg));
            return res.json({});
		} catch (error) {
            console.log(error);
        }
	},

	testRabbitMQ: async (req, res) => {
		try {
			// await QueueService.test();

			let p = await PrivateChat.create({
				user_sent_id: 1,
				user_recv_id: 2,
				message: "Hi",
				message_time: new Date(),
			}).fetch();

			return res.json({
				p: p,
			});
			// return res.json({ status: 'success' });
		} catch (error) {
			console.log("Error-TestController@testRabbitMQ: ", error);
			return res.json({ status: "error", message: "error" });
		}
	},

	testGetAllKey: async (req, res) => {
		try {
			let userIds = await UserMappingService.getAllKey();

			console.log(userIds);

			return res.json({});
		} catch (error) {
			console.log(error);
			return ResponseService.error(res);
		}
	},

	getJWT: async (req, res) => {
		try {
			let data = req.body.data;

			let jwt = await SessionService.generateJwt(data, "7d");

			return ResponseService.success(res, "success", { jwt: jwt }, 200);
		} catch (error) {
			console.log(error);
			return ResponseService.error(res);
		}
	},
};
