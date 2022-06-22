'use strict'


module.exports = {
    boardcastUser: async () => {
        try {
            
            let userIds = await UserMappingService.getAllKey();

            userIds = userIds.filter(id => {
                return id && id.split(':')[1]
            }).map(id =>  { 
                return parseInt(id.split(':')[1])
            });

            // console.log(userIds);

            sails.sockets.blast('getUsers', {
                data: userIds
            })
        } catch (error) {
            console.log('Error-ChatService@boardcastUser: ', error);
        }
    }
}