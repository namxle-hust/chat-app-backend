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
            let queueId = q.queue;
            
            req.socket.on('disconnect', async () => {
                await UserMappingService.delete(req.user.id);
                await QueueService.cancelQueue(queueId);
                console.log('User disconnected');
            });

            return ResponseService.success(res);
        } catch (error) {
            console.log('Error-ChatController@subscribe: ', error);
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
            let msgTime = new Date().getTime();

            let qmsg = JSON.stringify({
                recv_id: userRecvId,
                send_id: userSendId,
                msg: message,
                msgTime: msgTime
            })
            // Save message to the database


            // Public to chat exchange w/o routing key
            await QueueService.publish(userRecvId ,new Buffer(qmsg));

            return ResponseService.success(res);            

        } catch (error) {
            console.log('Error-ChatController@send: ', error);
            return ResponseService.error(res);
        }
    }
}