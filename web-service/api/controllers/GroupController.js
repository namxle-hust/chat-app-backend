/**
 * GroupController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    createGroup: async (req, res) => {
        try {
            let userId = req.user.id;
            let groupName = req.body.name ? req.body.name : '';
            let userIds = req.body.user_ids;

            let data = {
                user_id: userId,
                name: groupName
            }

            
            let group = await Groups.create(data).fetch();
            
            await GroupMemberships.create({ user_id: userId, group_id: group.id })

            await Promise.all(userIds.map(async (user_id) => {
                await GroupMemberships.create({
                    group_id: group.id,
                    user_id: user_id
                })
            }))

            let d = { group_id: group.id, user_id: userId, message_type: 'string', message: 'Group Created', message_time: new Date() }

            await GroupChat.create(d);

            return ResponseService.success(res, group);

        } catch (error) {
            console.log('Error-GroupController@createGroup: ', error);
            return ResponseService.success(res, 'Unknown Error!');
        }
    },

    addUserToGroup: async (req, res) => {
        try {
            let groupId = req.body.group_id;
            let userId = req.body.user_id;

            let groupMemberships = await GroupMemberships.find({ group_id: groupId, user_id: userId });

            if (groupMemberships && groupMemberships.length > 0) {
                console.log(groupMemberships);
                return ResponseService.error(res, 'User already existed in group!');
            }

            await GroupMemberships.create({ group_id: groupId, user_id: userId })

            return ResponseService.success(res);

        } catch (error) {
            console.log('Error-GroupController@addUserToGroup: ', error);
            return ResponseService.success(res, 'Unknown Error!');
        }
    },

    removeUserFromGroup: async (req, res) => {
        try {
            let user = req.user;
            let userId = req.body.user_id
            let groupId = req.body.group_id;

            let group = await Groups.findOne({ id: groupId });

            // console.log(group);

            if (!group) {
                return ResponseService.error(res, 'Invalid Group!');
            }
            
            if (group.user_id != user.id) {
                return ResponseService.error(res, 'Unauthorized!');
            }

            await GroupMemberships.destroy({ id: groupId, user_id: userId });

            return ResponseService.success(res);

        } catch (error) {
            console.log('Error-GroupController@removeUserFromGroup: ', error);
            return ResponseService.success(res, 'Unknown Error!');
        }
    },

    getAllUserWithinAGroup: async (req, res) => {
        try {
            let groupId = req.params.group_id;

            let groupMembers = await GroupMemberships.find({ group_id: groupId });

            let groupMemberIds = groupMembers.map(element => element.user_id);

            let users = await Users.find({ id: groupMemberIds })

            users.map(user => {
                delete user.password;
                return user;
            })

            return ResponseService.success(res, users);

        } catch (error) {
            console.log('Error-GroupController@getAllUserWithinAGroup: ', error);
            return ResponseService.success(res, 'Unknown Error!');
        }
    },

    
};
