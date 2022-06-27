var callStatus = "calling";

window.onbeforeunload = function (e) {
	var e = e || window.event;

	//IE & Firefox
	if (e) {
		e.returnValue = "Are you sure?";
	}

	// For Safari
	return "Are you sure?";
};

window.onunload = function (e) {
	console.log(213);
	if (callStatus != "closed") {
		closeCall();
	}
};

const videoGrid = document.getElementById("video-self");
const videoPartner = document.getElementById("video-partner");
const myVideo = document.createElement("video");
const myVideo2 = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
const endButton = document.querySelector("#end");
const listOptionsBtn = document.querySelector("#start");
var UserCallName = document.querySelectorAll(".userCallName");

const callingMessage = document.querySelector("#callingMessage");
const endMessage = document.querySelector("#endMessage");
const missedMessage = document.querySelector("#missedMessage");

myVideo.muted = false;
myVideo2.muted = false;

let currentCall;
let userName;

var userCall;

var peerId;

var peer = new Peer(undefined, {
	path: "/peerjs",
	host: "localhost",
	port: "9090",
});

peer.on("open", (id) => {
	peerId = id;
});

io.sails.url = "http://localhost:6002";
io.sails.useCORSRouteToGetCookie = false;
io.sails.query = `token=${user_token}`;

let callMessageId;

if (call_id) {
    callMessageId = call_id;
}

let updateUserName = (name) => {
	console.log(UserCallName);
	for (var i = 0; i < UserCallName.length; ++i) {
		UserCallName[i].textContent = name;
	}
	console.log(UserCallName);
};

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream);
	currentCall = call;
	callStatus = "in a call";
	call.on("stream", (userVideoStream) => {
		addVideoStream2(myVideo2, userVideoStream);
	});
};

let calling = async () => {
	try {
		return await new Promise((resolve, reject) => {
			console.log("Calling");
			io.socket.get("/call", { recvId: user_id }, function (res) {
				callMessageId = res.data.call_id;
                resolve(callMessageId);
				// if (res.status === 'success') setConnectSocketSuccess(true);
			});
		});
	} catch (error) {
		throw error;
	}
};

let closeCall = () => {
	console.log("Close");
	if (callStatus == "in a call") {
		callStatus = "closed";
		io.socket.get(
			"/finish-call",
			{ msg_id: callMessageId },
			function (res) {
				endButton.style = "display: block !important";
				listOptionsBtn.style = "display: none !important";
			}
		);
	} else if (callStatus == "calling") {
		callStatus = "closed";
		io.socket.get(
			"/cancel-call",
			{ msg_id: callMessageId, user_id: user_id },
			function (res) {
				endButton.style = "display: block !important";
				listOptionsBtn.style = "display: none !important";
			}
		);
	}
};

let answer = () => {
	console.log("Answering");
	let data = {
		response: "accept",
		user_recv_id: user_id,
		peer_id: peerId,
		msg_id: call_id,
	};
	io.socket.get("/answer-call", data, function (res) {});
};

let displayMessage = (name) => {
	endMessage.style = "display: none !important";
	callingMessage.style = "display: none !important";
	missedMessage.style = "display: none !important";
	if (name == "ended") {
		endButton.style = "display: block !important";
		listOptionsBtn.style = "display: none !important";
		endMessage.style = "display: block !important";
	} else if (name == "missed") {
		endButton.style = "display: block !important";
		listOptionsBtn.style = "display: none !important";
		missedMessage.style = "display: block !important";
	}
};

let getUserInformation = async () => {
	try {
		return await new Promise((resolve, reject) => {
			io.socket.get(
				"/get-user-information",
				{ user_id: user_id },
				function (res) {
					console.log(res);
					updateUserName(res.data.user.user_name);
					resolve(res.data.user);
				}
			);
		});
	} catch (error) {
		throw error;
	}
};

io.socket.on("getMessage", function (res) {
    console.log(res);
    if (res.message_type == "call" && callMessageId == res.id ) {
        console.log("arrival message !: ", res);
        if (res.message == "Missed Call") {
            callStatus = "closed";
            displayMessage("missed");
        }
        if (res.message == "Call Ended") {
            callStatus = "closed";
            displayMessage("ended");
            myVideo2.remove();
        }
    }
});




let init = async () => {
	try {
		userCall = await getUserInformation();

		if (status == "calling") {
			await calling();
		}

		io.socket.get("/subscribe", function (res) {
			// subscibe to socket server realtime
			console.log(res);
			if (res.status === "success") {
				console.log("connect socket successfully !");
				if (status == "answer") {
					answer();
				}
			} else {
				console.log("Socket error");
			}
		});
	} catch (error) {
		console.log(error);
	}
};

init();

// backBtn.addEventListener("click", () => {
// 	document.querySelector(".main__left").style.display = "flex";
// 	document.querySelector(".main__left").style.flex = "1";
// 	document.querySelector(".main__right").style.display = "none";
// 	document.querySelector(".header__back").style.display = "none";
// });

let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		audio: true,
		video: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
		peer.on("call", (call) => {
			displayMessage("none");
			currentCall = call;
			callStatus = "in a call";
			call.answer(stream);
			call.on("stream", (userVideoStream) => {
				addVideoStream2(myVideo2, userVideoStream);
			});

			currentCall = call;
		});

		io.socket.on("answerCall", (res) => {
			let peerId = res.data.peer_id;
			connectToNewUser(peerId, stream);
		});
	});

const addVideoStream2 = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoPartner.append(video);
	});
};

const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoGrid.append(video);
	});
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const hangUpCall = document.querySelector("#hangUp");

muteButton.addEventListener("click", () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		html = `<i class="fas fa-microphone-slash"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	} else {
		myVideoStream.getAudioTracks()[0].enabled = true;
		html = `<i class="fas fa-microphone"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	}
});

hangUpCall.addEventListener("click", () => {
	closeCall();
	if (currentCall) {
		currentCall.close();
	}
});

endButton.addEventListener("click", () => {
	window.close();
});

stopVideo.addEventListener("click", () => {
	const enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		html = `<i class="fas fa-video-slash"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	} else {
		myVideoStream.getVideoTracks()[0].enabled = true;
		html = `<i class="fas fa-video"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	}
});

// inviteButton.addEventListener("click", (e) => {
// 	prompt(
// 		"Copy this link and send it to people you want to meet with",
// 		window.location.href
// 	);
// });
