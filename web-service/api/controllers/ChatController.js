/**
 * ChatController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const multer = require('multer')
// const upload = multer();

module.exports = {
	getConversations: async (req, res) => {
		try {
			let user = req.user;

			let queryStrPrivateChat = `
            SELECT 
                a.user_id,
                (SELECT user_name FROM users WHERE id = a.user_id) as conversation_name,
                (
                    SELECT message FROM private_chat as p1 
                    WHERE 
                        (user_recv_id = ${user.id} AND user_sent_id = a.user_id)
                    OR
                        (user_sent_id = ${user.id} AND user_recv_id = a.user_id)
                    ORDER BY p1.message_time DESC
                    LIMIT 1
                ) as last_message,
                (
                    SELECT message_time FROM private_chat as p1 
                    WHERE 
                        (user_recv_id = ${user.id} AND user_sent_id = a.user_id)
                    OR
                        (user_sent_id = ${user.id} AND user_recv_id = a.user_id)
                    ORDER BY p1.message_time DESC
                    LIMIT 1
                ) as message_time,
                (
                    SELECT id FROM private_chat as p1 
                    WHERE 
                        (user_recv_id = ${user.id} AND user_sent_id = a.user_id)
                    OR
                        (user_sent_id = ${user.id} AND user_recv_id = a.user_id)
                    ORDER BY p1.message_time DESC
                    LIMIT 1
                ) as last_message_id,
                (
                    SELECT user_sent_id FROM private_chat as p1 
                    WHERE 
                        (user_recv_id = ${user.id} AND user_sent_id = a.user_id)
                    OR
                        (user_sent_id = ${user.id} AND user_recv_id = a.user_id)
                    ORDER BY p1.message_time DESC
                    LIMIT 1
                ) as last_message_owner_id,
                (SELECT 0) as is_group
            FROM 
                (
                    SELECT DISTINCT (user_recv_id) as user_id
                    FROM private_chat as p
                    WHERE p.user_sent_id = ${user.id}
                    UNION
                    SELECT DISTINCT(user_sent_id) as user_id
                    FROM private_chat as p
                    WHERE p.user_recv_id = ${user.id} 
                ) as a
            `;

			let queryStrGroupChat = `

                SELECT 
                    gm.group_id as conversation_id,
                    (SELECT g1.name FROM \`groups\` as g1 WHERE g1.id = gm.group_id) as conversation_name,
                    (SELECT 1) as is_group,
                    (
                        SELECT 
                            g.message as last_message
                        FROM group_chat as g
                        WHERE g.group_id = gm.group_id
                        ORDER BY g.message_time DESC
                        LIMIT 1
                    ) as last_message,
                    (
                        SELECT 
                            g.message_time as message_time
                        FROM group_chat as g
                        WHERE g.group_id = gm.group_id
                        ORDER BY g.message_time DESC
                        LIMIT 1
                    ) as message_time,
                    (
                        SELECT 
                            g.id as last_message_id
                        FROM group_chat as g
                        WHERE g.group_id = gm.group_id
                        ORDER BY g.message_time DESC
                        LIMIT 1
                    ) as last_message_id,
                    (
                        SELECT 
                            g.user_id as last_message_owner_id
                        FROM group_chat as g
                        WHERE g.group_id = gm.group_id
                        ORDER BY g.message_time DESC
                        LIMIT 1
                    ) as last_message_owner_id
                FROM group_memberships as gm WHERE gm.user_id = ${user.id}
                `;

			let result = await Promise.all([
				PrivateChat.getDatastore().sendNativeQuery(queryStrPrivateChat),
				GroupChat.getDatastore().sendNativeQuery(queryStrGroupChat),
			]);

			let privateChats =
				result[0] && result[0].rows ? result[0].rows : [];
			let groupChats = result[1] && result[1].rows ? result[1].rows : [];

			let chats = privateChats.concat(groupChats);

			chats.sort(function (a, b) {
				// Turn your strings into dates, and then subtract them
				// to get a value that is either negative, positive, or zero.
				return new Date(b.message_time) - new Date(a.message_time);
			});

			console.log(chats);

			return ResponseService.success(res, chats);
		} catch (error) {
			console.log("Error-ChatController@getConversations ", error);
			return ResponseService.error(res);
		}
	},

	getPrivateChat: async (req, res) => {
		try {
			let user = req.user;
			let partnerId = req.params.user_id;

			let partner = await Users.findOne({ id: partnerId });

			if (!partner) {
				return ResponseService.error(res, "Invalid user!");
			}

			let messages = await PrivateChat.find()
				.where({
					or: [
						{
							user_sent_id: user.id,
							user_recv_id: partnerId,
						},
						{
							user_sent_id: partnerId,
							user_recv_id: user.id,
						},
					],
				})
				.sort([{ id: "ASC" }, { message_time: "ASC" }]);

			console.log(messages);

			let data = {
				chats: messages,
				conversationName: partner.user_name,
				conversationImg: partner.profile_pic_url,
			};

			return ResponseService.success(res, data);
		} catch (error) {
			console.log("Error-ChatController@getPrivateChat: ", error);
			return ResponseService.error(res);
		}
	},

	getGroupChat: async (req, res) => {
		try {
			let user = req.user;
			let groupId = req.params.group_id;

			let group = await Groups.findOne({ id: groupId });

            let members = await GroupMemberships.find({ group_id: groupId });

            memebers = members.map(member => memeber.user_id);

			let messsages = await GroupChat.find()
				.where({
					group_id: groupId,
				})
				.sort([{ message_time: "ASC" }, { id: "ASC" }]);

			let data = {
				chats: messsages,
				conversationName: group.name,
				conversationImg: null,
                memebers: memebers
			};

			return ResponseService.success(res, data);
		} catch (error) {
			console.log("Error-ChatController@getGroupChat: ", error);
			return ResponseService.error(res);
		}
	},

	upload: async (req, res) => {
		try {
			req.file("image").upload(
				{
					dirname: require("path").resolve(
						sails.config.appPath,
						"assets/public/chats"
					),
				},
				function (err, uploadedFiles) {
					if (err) return ResponseService.error(res);

                    let file = uploadedFiles[0];

                    file.fd = file.fd.split('/home/ubuntu/service/assets/')[1]

					return ResponseService.success(res, {
                        file_path: file
                    })
				}
			);
		} catch (error) {
			console.log("Error-ChatController@upload: ", error);
			return ResponseService.error(res);
		}
	},
};
