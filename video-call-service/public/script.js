var callStatus = "calling";

window.onbeforeunload = function (e) {
	if (callStatus == "closed") {
		return;
	}

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

myVideo.muted = true;

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

if (call_id && call_id != "null") {
	callMessageId = call_id;
}


io.socket.on("getMessage", function (res) {
	console.log("arrival message: ", res);
	console.log(callMessageId);
	if (res.message_type == "call" && callMessageId == res.id) {
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



let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		audio: true,
		video: true,
	})
	.then((stream) => {
        init();
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
		peer.on("call", (call) => {
			displayMessage("none");
			currentCall = call;
			call.answer(stream);
			call.on("stream", (userVideoStream) => {
				addVideoStream2(myVideo2, userVideoStream);
			});

			currentCall = call;
		});

		io.socket.on("answerCall", (res) => {
			let peerId = res.data.peer_id;
			console.log(res);
			connectToNewUser(peerId, stream);
		});
	});




// backBtn.addEventListener("click", () => {
// 	document.querySelector(".main__left").style.display = "flex";
// 	document.querySelector(".main__left").style.flex = "1";
// 	document.querySelector(".main__right").style.display = "none";
// 	document.querySelector(".header__back").style.display = "none";
// });


function answer () {
	console.log("Answering");
	let data = {
		response: "accept",
		user_recv_id: user_id,
		peer_id: peerId,
		msg_id: call_id,
	};
	callStatus = "in a call";
	io.socket.get("/answer-call", data, function (res) {
		console.log(res);
	});
};

function displayMessage(name) {
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

async function getUserInformation () {
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


function addVideoStream2(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoPartner.append(video);
	});
}

async function init() {
	try {
		userCall = await getUserInformation();

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

		if (status == "calling") {
			await calling();
		}
	} catch (error) {
		console.log(error);
	}
};

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoGrid.append(video);
	});
}

function updateUserName(name) {
	console.log(UserCallName);
	for (var i = 0; i < UserCallName.length; ++i) {
		UserCallName[i].textContent = name;
	}
	console.log(UserCallName);
}

function connectToNewUser(userId, stream) {
	const call = peer.call(userId, stream);
	currentCall = call;
	callStatus = "in a call";
	call.on("stream", (userVideoStream) => {
		console.log("connecting");
		addVideoStream2(myVideo2, userVideoStream);
	});
}

async function calling() {
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
}


function closeCall () {
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

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const hangUpCall = document.querySelector("#hangUp");
const shareScreenBtn = document.querySelector("#shareScreen");
const stopShareScreenBtn = document.querySelector('#stopShareScreen')

var isSharingScreen = false;

shareScreenBtn.addEventListener("click", () => {
    isSharingScreen = true;
    stopShareScreenBtn.style = "display: flex !important";
    shareScreenBtn.style = "display: none !important";
    shareScreen();
})

stopShareScreenBtn.addEventListener("click", () => {
    isSharingScreen = false;

    shareScreenBtn.style = "display: flex !important";
	stopShareScreenBtn.style = "display: none !important";
    stopShareScreen();
})


muteButton.addEventListener("click", () => {
    // stopShareScreen();
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
	// shareScreen();
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

var currentScreeTrack;

function stopShareScreen() {
    myVideo.srcObject = myVideoStream;
    for (let [key, value] of peer._connections.entries()) {
        console.log(peer._connections.get(key)[0].peerConnection.getSenders())
        peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(myVideoStream.getTracks()[1])
    }
}

function shareScreen() {
	navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
		const screenTrack = stream.getTracks()[0];
        currentScreeTrack = stream
        myVideo.srcObject = stream;
        for (let [key, value] of peer._connections.entries()) {
            peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(screenTrack) ;
        }

		screenTrack.onended = function () {
            console.log(123);
            for (let [key, value] of peer._connections.entries()) {
                peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(myVideoStream.getTracks()[1]); 
            }
		};
	});
}

// inviteButton.addEventListener("click", (e) => {
// 	prompt(
// 		"Copy this link and send it to people you want to meet with",
// 		window.location.href
// 	);
// });
