module.exports = {

    subscribe: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }
    
            // console.log(req.socket.id);
            // console.log(req.user.id);
            let q = await QueueService.bindQueue(req.user.id);

            await UserMappingService.save(req.user.id, req.socket.id);

            await ChatService.boardcastUser();
            
            req.socket.on('disconnect', async () => {
                await QueueService.cancelConsumerTag(req.user.id);
                await UserMappingService.delete(req.user.id, req.socket.id);
                await ChatService.boardcastUser();
                console.log('User disconnected');
            });

            return ResponseService.success(res);
        } catch (error) {
            console.log('Error-ChatController@subscribe: ', error);
            return ResponseService.error(res);
        }
        
    },

    sendGroup: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }

            let data = req.body

            let message = data.message;
            let groupRecvId = data.recvId;
            let userSendId = req.user.id;
            let msgType = data.msg_type
            let msgTime = new Date();
            
            // Message for queue
            let qmsg = JSON.stringify({
                group_id: groupRecvId,
                user_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                is_group: true
            })

            // Save message to the database
            let msg = {
                user_id: userSendId,
                group_id: groupRecvId,
                message_type: msgType,
                message: message,
                message_time: msgTime
            }

            await GroupChat.create(msg);
            await GroupService.send(qmsg, groupRecvId);

            return ResponseService.success(res);
        
        } catch (error) {
            console.log('Error-ChatController@sendGroup: ', error);
            return ResponseService.error(res);
        }
    },

    send: async (req, res) => {
        try {

            if (!req.isSocket) {
                return req.badRequest();
            }

            let data = req.body

            let message = data.message;
            let userRecvId = data.recvId;
            let userSendId = req.user.id;
            let msgType = data.msg_type
            let msgTime = new Date();

            let qmsg = JSON.stringify({
                user_recv_id: userRecvId,
                user_sent_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                msg_time_total: 0
            })

            let messageResponse = {
                recv_id: userRecvId,
                send_id: userSendId,
                msg: message,
                msg_type: msgType,
                msg_time: msgTime
            }
            
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

            return ResponseService.success(res, messageResponse);         

        } catch (error) {
            console.log('Error-ChatController@send: ', error);
            return ResponseService.error(res);
        }
    }
}