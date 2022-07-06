# Social chat app backend
Project for IT4883Q

## Introduction:
Create a real-time chat application backend with 7 services
  - Web service
  - Chat service
  - User mapping service
  - Session service
  - Queue Service
  - Video call service
  
### Architecture:


![image](https://user-images.githubusercontent.com/103374580/177462179-d9bf1e82-b52d-4ea0-80f5-58b75ead6e59.png)


### Service detail:
  #### 1.Web service
  - This service build based on [Sailsjs](https://github.com/balderdashy/seed/blob/master/README.md) framework.
  
  - This service does not need to use web-socket and it only receive normal http request.
  
  - This service use to handling web chat based services like: 
  
    - Login, Logout, Register.
    - Get all/specific message(s).
    - Get all/specific user(s).
    - Update user information.
    - Create group, add user to group.
    - Get group conversations.
    - Upload images.
    
  
  #### 2.Chat service
  - This service build based on [Sailsjs](https://github.com/balderdashy/seed/blob/master/README.md) framework.

  - This service use only web-socket to communicate with clients & push socket message from one client to others.
    
  - This service used for handling chat actions like:
  
    - Subscribe socket.
    - Send/Receive chat/group chat via socket.
    - Update message status.
    - Send call/group call message
    - Update call/group call information
    
  #### User mapping service
  - This service build based on [Redis](https://redis.io/).
  
  - This service used for storing socket id of all user are online with purpose to get socket id based on user id
  
  - Example with user with user_id = 1 and socket_id = qCrkQAY1ZeKhUFQPAAAB:
  
    Key: "id:2" Value: "qCrkQAY1ZeKhUFQPAAAB" 
    
  #### Session service
  - This service build based on [Redis](https://redis.io/).
  
  - This service used for storing revoked jwt because this application use jwt to authenticate users.
  
  #### Queue service
  - This service build based on [RabbitMQ](https://www.rabbitmq.com/)
  
  - This service used for queuing client messages and then publish to other designation client via web-socket
  
