# Social chat app backend

<br>

## Documentation
* [Introduction](#introduction)
  - [Features] (#features)
* [Detail](#detail)
  - [Technology Stack](#i-technology-stack)
  - [Services](#ii-services)
  - [Architecture](#iii-architecture)
  - [Service Detail](#iv-service-detail)
* [Installation Guild](#installation-guide)

## Introduction:
Project for IT4883Q.<br>
This application is build by our teams with 6 members for course IT4883Q in HUST.<br>
This application called: <b>Socical Chat</b> with some typical features of a regular chat app.

### Features
  1. Login, logout, register.
  2. Private chat (send text, emoji, images).
  3. Group chat (send text, emoji, images).
  4. View your profile.
  5. View other users's profile.
  6. Update password, user name, email.
  7. Show user status (online, offline).
  8. View friend list.
  9. View all conversations Private chat (1v1) and Group chat.
  10. Video call for private chat and group chat.
  11. Screen sharing for private chat & group chat.
  12. Show message status (Sent or Delivered) for the owner of the message.
  
  

## Detail

### I. Technology Stack

  - [Sailsjs](https://sailsjs.com/)
  - [Redis](https://redis.io/)
  - [Peerjs](https://peerjs.com/)
  - [RabbitMQ](https://www.rabbitmq.com/)
  - [Expressjs](https://expressjs.com/)
  - [Mysql](https://www.mysql.com/)

### II. Services

Create a real-time chat application backend with 7 services
  - Web service
  - Chat service
  - User mapping service
  - Session service
  - Queue Service
  - Video call service
  - Database
  
### III. Architecture:


![image](https://user-images.githubusercontent.com/103374580/177462179-d9bf1e82-b52d-4ea0-80f5-58b75ead6e59.png)


### IV. Service detail:
  #### 1. Web service
  - This service build based on [Sailsjs](https://sailsjs.com/) framework.
  
  - This service does not need to use web-socket and it only receive normal http request.
  
  - This service use to handling web chat based services like: 
  
    - Login, Logout, Register.
    - Get all/specific message(s).
    - Get all/specific user(s).
    - Update user information.
    - Create group, add user to group.
    - Get group conversations.
    - Upload images.
    
  
  #### 2. Chat service
  - This service build based on [Sailsjs](https://sailsjs.com/) framework.

  - This service use only web-socket to communicate with clients & push socket message from one client to others.
    
  - This service used for handling chat actions like:
  
    - Subscribe socket.
    - Send/Receive chat/group chat via socket.
    - Update message status.
    - Send call/group call message
    - Update call/group call information
    
  #### 3. User mapping service
  - This service build based on [Redis](https://redis.io/).
  
  - This service used for storing socket id of all user are online with purpose to get socket id based on user id
  
  - Example with user with user_id = 1 and socket_id = qCrkQAY1ZeKhUFQPAAAB:
  
    Key: "id:2" Value: "qCrkQAY1ZeKhUFQPAAAB" 
    
  #### 4. Session service
  - This service build based on [Redis](https://redis.io/).
  
  - This service used for storing revoked jwt because this application use jwt to authenticate users.
  
  #### 5. Queue service
  - This service build based on [RabbitMQ](https://www.rabbitmq.com/).
  
  - This service used for queuing client messages and then publish to other designation client via web-socket.

  #### 6. Video Call service
  - This service build based on [ExpressJS](https://expressjs.com/).

  - This service used for create peers between clients for transfering video stream & voice stream.
  
  - Use [Peerjs](https://peerjs.com/) to create peers between clients.

  #### 7. Database
  - This service build based on [Mysql](https://www.mysql.com/).
  
  - This service used for storing all the records of the application.



## Installation Guide

### Prerequsite

- You should have installed Docker & Docker Desktop
- For [Windows](https://docs.docker.com/desktop/windows/install/)
- For [MacOS](https://docs.docker.com/desktop/mac/install/)

### 1. Create Project Folder

```
 $ mkdir chat-application
 
 $ cd chat-application
```
### 2. Cloning frontend & backend

```
 $ git clone https://github.com/namxle-hust/chat-app-backend.git
  
 $ git clone https://github.com/namxle-hust/chat-app-frontend.git
```

### 3. Moving docker-compose file

```
 $ cp chat-app-backend/docker-compose/docker-compose.yml .
```

```
Note: After moving docker-compose file. The directory tree will be like this:

    .
    ├── chat-app-backend            
        ├── chat-service            
        ├── docker-compose          
            ├── docker-compose.yml  
        ├── video-call-service      
        ├── web-service             
        └── README.md
    ├── chat-app-frontend           
    └── docker-compose.yml          
```

### 4. Run

```
 $ docker-compose up -d
```
NOTE: After running the command above, you should check if all the container is running properly in Docker Desktop





