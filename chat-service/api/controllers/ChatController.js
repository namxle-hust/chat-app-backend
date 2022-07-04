module.exports = {

    subscribe: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }
    
            console.log(req.socket.id);
            console.log(req.user.id);
            
            await UserMappingService.save(req.user.id, req.socket.id);

            await Promise.all([QueueService.bindQueue(req.user.id), QueueService.bindQueueUpdateMessage(req.user.id)]);

            await ChatService.boardcastUser();
            
            req.socket.on('disconnect', async () => {
                await UserMappingService.delete(req.user.id, req.socket.id);
                await Users.update({ id: req.user.id }, { last_online_time: new Date() });
                await Promise.all([QueueService.cancelConsumerTag(req.user.id), QueueService.cancelConsumerTagUpdateMessage(req.user.id)])
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
            // if (!req.isSocket) {
            //     return req.badRequest();
            // }

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
                message_time: msgTime,
                status: 'sent',
            }
            let messageCreated = await GroupChat.create(msg).fetch();

            let resMessage = {
                group_id: groupRecvId,
                user_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                is_group: true,
                id: messageCreated.id
            }

            ResponseService.success(res, resMessage);

            let quemsg = {
                status: 'sent',
                id: messageCreated.id,
                is_group: true,
                group_id: messageCreated.group_id,
                message_time: msgTime
            }

            await QueueService.publishUpdateMessage(messageCreated.user_id ,new Buffer(JSON.stringify(quemsg)));

            // Message for queue
            let qmsg = JSON.stringify(resMessage)

            await GroupService.send(qmsg, groupRecvId, userSendId, true);

        
        } catch (error) {
            console.log('Error-ChatController@sendGroup: ', error);
            return ResponseService.error(res);
        }
    },

    updateGroupMessage: async (req, res) => {
        try {
            if (!req.isSocket) {
                return req.badRequest();
            }

            let messageId = req.body.id;
            let status = req.body.status;
            let message_time = new Date();

            if (status == 'delivered') {
                let message = await GroupChat.findOne({ id: messageId });

                if (message.status == 'delivered') {
                    return ResponseService.success(res);
                }

                let quemsg = {
                    status: 'delivered',
                    id: messageId,
                    is_group: true,
                    group_id: message.group_id,
                    message_time: message_time
                }

                quemsg = JSON.stringify(quemsg);

                await QueueService.publishUpdateMessage(message.user_id ,new Buffer(quemsg));

                ResponseService.success(res);

                await GroupChat.update({ id: messageId }, { status: status });

            }

        } catch (error) {
            console.log('Error-ChatController@updateGroupMessage: ', error);
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
            let userRecvId = req.body.user_sent_id;

            if (status == 'delivered') {
                let quemsg = {
                    status: 'delivered',
                    id: messageId,
                    message_time: message_time
                }

                quemsg = JSON.stringify(quemsg);

                await QueueService.publishUpdateMessage(userRecvId ,new Buffer(quemsg));

                ResponseService.success(res);

                await PrivateChat.update({ id: messageId }, { status: status });
                

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


            let messageResponse = {
                user_recv_id: userRecvId,
                user_sent_id: userSendId,
                message: message,
                message_type: msgType,
                message_time: msgTime,
                status: 'sent',
                id: messageCreated.id
            }

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