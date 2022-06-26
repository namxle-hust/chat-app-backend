const express = require("express");
const app = express();
const server = require("http").Server(app);
const { ExpressPeerServer } = require("peer");

app.set("view engine", "ejs");

const peerServer = ExpressPeerServer(server, {
	debug: true,
	path: "/",
});

app.use("/peerjs", peerServer);

app.use(express.static("public"));

app.get("/:user_token/:user_id/:status/:call_id", (req, res) => {
	res.render("call", { user_token: req.params.user_token, user_id: req.params.user_id, status: req.params.status, call_id: req.params.call_id });
});
app.get("/test/:user_token/:user_id/:status/:call_id", (req, res) => {
	res.render("test", { user_token: req.params.user_token, user_id: req.params.user_id, status: req.params.status, call_id: req.params.call_id });
});

server.listen(9090);
