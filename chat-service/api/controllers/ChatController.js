module.exports = {

    subscribe: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }
    
            // console.log(req.socket.id);
            // console.log(req.user.id);

            await UserMappingService.save(req.user.id, req.socket.id);

            let q = await QueueService.bindQueue(req.user.id);
            
            req.socket.on('disconnect', async () => {
                await QueueService.cancelConsumerTag(req.user.id);
                await UserMappingService.delete(req.user.id);
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
            let msgType = req.msg_type
            let msgTime = new Date().getTime();
            
            // Message for queue
            let qmsg = JSON.stringify({
                recv_id: null,
                send_id: userSendId,
                msg: message,
                msg_type: msgType,
                msg_time: msgTime,
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
        
        } catch (error) {
            console.log('Error-ChatController@sendGroup: ', error);
            return ResponseService.error(res);
        }
    },

    getMessages: async (req, res) => {
        try {
            let userId = req.user.id;

            let messages = await PrivateChat.find().where({
                or: [{ user_recv_id: userId, user_sent_id: userId }]
            }).sort('id DESC');


            return ResponseService.success(res, messages);


        } catch (error) {
            console.log('Error-ChatController@getMessage: ', error);
            return ResponseService.error(res);
        }
    },

    getGroupMessages: async (req, res) => {
        try {

            let groupId = req.group_id;

            let messages = await GroupChat.find({ id: groupId })
            
            return ResponseService.success(res, messages);

        } catch (error) {
            console.log('Error-ChatController@getGroupMessage: ', error);
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
            let msgType = req.msg_type
            let msgTime = new Date().getTime();

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

            return ResponseService.success(res);            

        } catch (error) {
            console.log('Error-ChatController@send: ', error);
            return ResponseService.error(res);
        }
    }
}