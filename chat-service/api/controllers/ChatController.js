module.exports = {

    subscribe: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }
    
            console.log(req.socket.id);
            console.log(req.user.id);
            
            await UserMappingService.save(req.user.id, req.socket.id);

            let q = await QueueService.bindQueue(req.user.id);

            await ChatService.boardcastUser();
            
            req.socket.on('disconnect', async () => {
                await UserMappingService.delete(req.user.id, req.socket.id);
                await QueueService.cancelConsumerTag(req.user.id);
                await ChatService.boardcastUser();
                console.log('User disconnected');
            });

            return ResponseService.success(res,  { user_id: req.user.id });
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

            // Save message to the database
            let msg = {
                user_id: userSendId,
                group_id: groupRecvId,
                message_type: msgType,
                message: message,
                message_time: msgTime
            }
            let messageCreated = await GroupChat.create(msg).fetch();

            // Message for queue
            let qmsg = JSON.stringify({
                group_id: groupRecvId,
                user_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                is_group: true,
                id: messageCreated.id
            })

            await GroupService.send(qmsg, groupRecvId);

            return ResponseService.success(res);
        
        } catch (error) {
            console.log('Error-ChatController@sendGroup: ', error);
            return ResponseService.error(res);
        }
    },

    updateMessage: async (req, res) => {
        try {

            if (!req.isSocket) {
                return req.badRequest();
            }

            let messageId = req.body.id;
            let status = req.body.status;
            let message_time = new Date();

            if (status == 'delivered') {
                let quemsg = {
                    status: 'delivered',
                    id: messageId,
                    message_time: message_time
                }

                let message = await PrivateChat.update({ id: messageId }, { status: status }).fetch();

                message = message[0];

                if (message) {
                    let socketIds = await UserMappingService.getSocketId(message.user_sent_id);

                    if (socketIds && socketIds.length > 0) {
                        socketIds.forEach(sckId => {
                            sails.sockets.broadcast(sckId, 'updateMessage', quemsg);
                        })
                    }
                }
            }

        } catch (error) {
            console.log('Error-ChatController@updateMessage: ', error);
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

            let messageResponse = {
                user_recv_id: userRecvId,
                user_sent_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                status: 'sent'
            }
            
            // Save message to the database
            let msg = {
                user_sent_id: userSendId,
                user_recv_id: userRecvId,
                message_type: msgType,
                message_time: msgTime,
                message: message,
                status: 'sent'
            }

            let messageCreated = await PrivateChat.create(msg).fetch();

            let qmsg = JSON.stringify({
                user_recv_id: userRecvId,
                user_sent_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                msg_time_total: 0,
                id: messageCreated.id
            })

            ResponseService.success(res, messageResponse);       

            let quemsg = {
                status: 'sent',
                id: messageCreated.id,
                message_time: msgTime
            }

            let socketIds = await UserMappingService.getSocketId(userSendId);

            if (socketIds && socketIds.length > 0) {
                socketIds.forEach(sckId => {
                    sails.sockets.broadcast(sckId, 'updateMessage', quemsg);
                })
            }

            // Public to chat exchange w/o routing key
            await QueueService.publish(userRecvId ,new Buffer(qmsg));

        } catch (error) {
            console.log('Error-ChatController@send: ', error);
            return ResponseService.error(res);
        }
    }
}