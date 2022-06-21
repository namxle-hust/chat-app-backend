const express = require("express");
const app = express();
const server = require("http").Server(app);
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
  });


app.use('/peerjs', peerServer);

server.listen(9090);
