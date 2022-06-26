"use strict";

const amqplib = require("amqplib");
const ex = 'direct_logs';

module.exports = {
	initConnection: async () => {
		try {
			let conn = await amqplib.connect(
				`amqp://${process.env.RABBIT_MQ_ADDR}`
			);

            let channel = await conn.createChannel();

            // let channelConsume = await conn.createChannel();
            
			global.RABBIT_MQ_CONNECTION = channel;
			global.RABBIT_MQ_CONNECTION.is_alive = true;
            
            channel.on('close', () => {
                global.RABBIT_MQ_CONNECTION = null;
            })

            channel.on('error', () => {
                global.RABBIT_MQ_CONNECTION = null;
            })

			return true;
		} catch (error) {
			console.log("Error-QueueService@initConnection: ", error);
		}
	},


    remove: async (id, queueId) => {
        try {
            const ch = await QueueService.getChannel();

            let key = Users.getUserQueueKey(id);
            await ch.unbindQueue(queueId, ex, key);

            await ch.deleteQueue(key);

        } catch (error) {
            throw error;
        }
    },

    publishUpdateMessage: async (user_id, content) => {
        try {

            let key = Users.getUserUpdateMessageQueueKey(user_id);

            const ch = await QueueService.getChannel();

            await ch.publish(ex, key, content, {deliveryMode: 2, mandatory: true});

            return true;

        } catch (error) {
            throw error;
        }
    },

    publish: async (user_id, content) => {
        try {
            let key = Users.getUserQueueKey(user_id);

            const ch = await QueueService.getChannel();

            await ch.publish(ex, key, content, {deliveryMode: 2, mandatory: true});

            return true;

        } catch (error) {
            throw error;
        }
    },

    bindQueueUpdateMessage: async (id) => {
        try {
            let socketId = await UserMappingService.getSocketId(id);

            // Not binding queue if user already online
            if (socketId && socketId.length > 1) {
                console.log("Not bind")
                console.log(id);
                console.log(socketId)
                return null;
            }

            let key = Users.getUserUpdateMessageQueueKey(id);

            let queueName = Users.getUserUpdateMessageQueueName(id);

            let consumerTag = Users.getConsumerTagUpdateMessage(id);

            const ch = await QueueService.getChannel();

            await ch.assertExchange(ex, 'direct', {durable: false});

            let q = await ch.assertQueue(queueName, { durable: true });

            await ch.bindQueue(q.queue, ex, key);

            await ch.consume(q.queue, async (msg) => {
                try {
                    if (msg !== null) {		    								
                        let encodemsg = msg.content.toString();
                        let quemsg = JSON.parse(encodemsg);
                        
                        
                        let socketIds = await UserMappingService.getSocketId(id);
                        socketIds.forEach(sckId => {
                            console.log(quemsg);
                            sails.sockets.broadcast(sckId, 'updateMessage', quemsg);
                        })
                    }

                } catch (error) {
                    console.log(error);
                }
                // console.log("Test");
            }, {noAck: true, consumerTag: consumerTag});

            return q;

        } catch (error) {
            throw error;
        }
    },

    bindQueue: async (id) => {
        try {
            let socketId = await UserMappingService.getSocketId(id);

            // Not binding queue if user already online
            if (socketId && socketId.length > 1) {
                console.log("Not bind")
                console.log(id);
                console.log(socketId)
                return null;
            }

            let key = Users.getUserQueueKey(id);

            let queueName = Users.getUserQueueName(id);

            let consumerTag = Users.getUserConsumerTag(id);

            const ch = await QueueService.getChannel();

            await ch.assertExchange(ex, 'direct', {durable: false});

            let q = await ch.assertQueue(queueName, { durable: true });

            await ch.bindQueue(q.queue, ex, key);

            await ch.consume(q.queue, async (msg) => {
                try {
                    if (msg !== null) {		    								
                        let encodemsg = msg.content.toString();
                        let quemsg = JSON.parse(encodemsg);
                        // console.log(quemsg);
                        
                        let socketIds = await UserMappingService.getSocketId(id);
                        if (socketIds && socketIds.length > 0) {
                            socketIds.forEach(sckId => {
                                sails.sockets.broadcast(sckId, 'getMessage', quemsg);
                            })
                            ch.ack(msg);
                        } else {
                            ch.nack(msg);
                            // await QueueService.cancelConsumerTag(id)
                            console.log('Consumer cancelled by server');
                            // throw ResponseService.customError('Consumer cancelled by server 2');
                            
                        }
                    }

                } catch (error) {
                    console.log(error);
                }
                // console.log("Test");
            }, {noAck: false, consumerTag: consumerTag});

            return q;

        } catch (error) {
            throw error;
        } 
    },

    cancelConsumerTag: async (userId) => {
        try {

            let consumerTag = Users.getUserConsumerTag(userId);

            const ch = await QueueService.getChannel();

            let value = await UserMappingService.getSocketId(userId);

            if (value.length < 1) {
                console.log(`Cancel ${consumerTag}`)

                await ch.cancel(consumerTag);
            }

            return true;
        } catch (error) {
            throw error;
        }
    },

    cancelConsumerTagUpdateMessage: async (userId) => {
        try {

            let consumerTag = Users.getConsumerTagUpdateMessage(userId);

            const ch = await QueueService.getChannel();

            let value = await UserMappingService.getSocketId(userId);

            if (value.length < 1) {
                console.log(`Cancel ${consumerTag}`)

                await ch.cancel(consumerTag);
            }

            return true;
        } catch (error) {
            throw error;
        }
    },



	test: async () => {
		try {
            const queue = 'tasks';
            
			let conn = await QueueService.connect();

			const ch1 = await conn.createChannel();
			await ch1.assertQueue(queue);

			// Listener
			ch1.consume(queue, (msg) => {
				if (msg !== null) {
					console.log("Recieved:", msg.content.toString());
					ch1.ack(msg);
				} else {
					console.log("Consumer cancelled by server");
				}
			});

			// Sender
			const ch2 = await conn.createChannel();

			setInterval(() => {
				ch2.sendToQueue(queue, Buffer.from("something to do"));
			}, 1000);

		} catch (error) {
			console.log("Error-QueueService@test: ", error);
		}
	},

	getChannel: async () => {
		try {
			if (!global.RABBIT_MQ_CONNECTION) {
				console.log("Initial rabbit mq connection");
				await QueueService.initConnection();
			}

			if (global.RABBIT_MQ_CONNECTION && global.RABBIT_MQ_CONNECTION.is_alive) {
				return global.RABBIT_MQ_CONNECTION
			}

            return null;

		} catch (error) {
			console.log("Error-QueueService@connect: ", error);
		}
	},
};
