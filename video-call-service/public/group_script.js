/* 
    http://localhost:9090/test/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxfSwiaWF0IjoxNjU2NzUzOTkyLCJleHAiOjE2NTczNTg3OTJ9.xgjRoi93aqSidjJuo7VF8eOsYxZpb12v2Rv2h4qRhkE/4/calling/null


    user 3

    http://localhost:9090/test/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjozfSwiaWF0IjoxNjU2ODIxNDU1LCJleHAiOjE2NTc0MjYyNTV9.SxjCTtdfzDkSCJ7-AdP0iJNlbIWTpa3tHxeR5qAnO84/4/answer/88

    user 2
    http://localhost:9090/test/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoyfSwiaWF0IjoxNjU2ODMyNzEwLCJleHAiOjE2NTc0Mzc1MTB9.XGGaSDWCd2jw2QHWW3vS1kzyfbUYD38MYUpvqgtmvp8/4/answer/90
   
*/

var callStatus = 'calling';


window.onbeforeunload = function (e) {
    if (callStatus == 'closed') {
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



const videoGrid = document.getElementById("video-partner");
var GroupCallName = document.querySelectorAll(".userCallName");
const myVideo = createVideoElement('You');
myVideo.video.muted = true;
const callingMessage = document.querySelector("#callingMessage");
const endMessage = document.querySelector("#endMessage");
const missedMessage = document.querySelector("#missedMessage");
const videos__myself = document.querySelector('#videos__myself');
var currentShareElements;

var isPeerSharingScreen = false;

if (status == 'calling') {
    videoGrid.classList.remove("align-items-center");
} else {
    callingMessage.style = "display: none !important";
}

const peers = {};
const elements = {};

var peerId;

var userCall;

var currentUser;

var callMessageId;

if (call_id && call_id != "null") {
	callMessageId = call_id;
}

const peer = new Peer(undefined, {
	host: "localhost",
	path: "/peerjs",
	port: "9090",
});

peer.on("open", (id) => {
	peerId = id;
});

io.sails.url = "http://localhost:6002";
io.sails.useCORSRouteToGetCookie = false;
io.sails.query = `token=${user_token}`;


let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
        getMessages();

        init();

        myVideoStream = stream
		addVideoStream(myVideo.video, stream, myVideo.div);

		peer.on("call", (call) => {
            console.log(call.metadata.user_name);
            callStatus = 'in a call';
			call.answer(stream);
			const element = createVideoElement(call.metadata.user_name);
            peers[call.metadata.user_id] = call;
            elements[call.metadata.user_id] = element;
			call.on("stream", (userVideoStream) => {
				addVideoStream(element.video, userVideoStream, element.div);
			});
            call.on("close", () => {
                element.div.remove();
            });

		});

		io.socket.on("group_answering", (res) => {
			connectToNewUser(res.data, stream);
		});
	});

io.socket.on("group_leave", (res) => {
	let userId = res.data.user_leave_id;
    console.log(res);
	if (peers[userId]) { 
        peers[userId].close() 
    };
});

io.socket.on("screen_sharing", (res) => {
	console.log(res);
    let userId = res.user_share.id;
    const shareElements = elements[userId].div;
    currentShareElements = shareElements;
    // console.log(shareElements);
    // console.log(videoGrid);
    if (res && res.status == 'share') {
        isPeerSharingScreen = true;
        videoGrid.removeChild(shareElements);
        videoGrid.classList.add('show-screen-partners');
        shareElements.classList.add('show-screen');
        videos__myself.append(shareElements);
    } else if (res && res.status == 'stop') {
        isPeerSharingScreen = false;
        resetShareElements()
    }
    
});

function resetShareElements () {
    if (videos__myself.contains(currentShareElements)) {
        videos__myself.removeChild(currentShareElements)
    }
    if (videoGrid.classList.contains('show-screen-partners')) {
        videoGrid.classList.remove('show-screen-partners')
    }
    if (currentShareElements.classList.contains('show-screen')) {
        currentShareElements.classList.remove('show-screen')
        videoGrid.append(currentShareElements);
    }
}


function screenSharingNotify (shareStatus) {
    io.socket.get('/screen-sharing-notify', { group_id: group_id, status: shareStatus }, function (res) {
    })
}

async function init() {
	try {
		groupCall = await getGroupInformation();

		if (status == "calling") {
			await calling();
		}

		io.socket.get("/subscribe", function (res) {
			// subscibe to socket server realtime
			console.log(res);
			if (res.status === "success") {
				console.log("connect socket successfully !");
				if (status == "answer") {
					doAnswer();
				}
			} else {
				console.log("Socket error");
			}
		});
	} catch (error) {
		console.log(error);
	}
}

function connectToNewUser(data, stream) {
    console.log('Connect to user: ');
    console.log(data);

    if (status == 'calling') {
        videoGrid.classList.add("align-items-center");
        callingMessage.style = "display: none !important";
    }

    options = {metadata: {user_name: currentUser.user_name, user_id: currentUser.id}};

	const call = peer.call(data.peer_id, stream, options);
	const element = createVideoElement(data.user_name);
	call.on("stream", (userVideoStream) => {
		callStatus = "in a call";
		addVideoStream(element.video, userVideoStream, element.div);
	});
	call.on("close", () => {
		element.div.remove();
	});

	peers[data.user_sent_id] = call;
    elements[data.user_sent_id] = element;
}

function createVideoElement (name) {
    var div = document.createElement('div');
    var div2 = document.createElement('div');
    const video = document.createElement("video");

    div2.textContent = name;
    div2.classList.add('inner-name')
    div.classList.add('video-div-surround');
    
    div.append(div2);
    div.append(video);

    return {
        div: div,
        video: video
    };
}

function addVideoStream(video, stream, div) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
        video.muted = true;
	});
	videoGrid.append(div);
}


async function calling() {
	try {
		return await new Promise((resolve, reject) => {
			console.log("Calling");
			io.socket.get("/call-group", { recvId: group_id }, function (res) {
				callMessageId = res.data.call_id;
				resolve(callMessageId);
			});
		});
	} catch (error) {
		throw error;
	}
}

async function doAnswer() {
	console.log("Answering");
	let data = {
		response: "accept",
		group_id: group_id,
		peer_id: peerId,
		msg_id: call_id,
	};
	io.socket.get("/answer-group-call", data, function (res) {});
}

async function getGroupInformation() {
	try {
		return await new Promise((resolve, reject) => {
			io.socket.get(
				"/get-group-information",
				{ group_id: group_id },
				function (res) {
					console.log(res);
                    currentUser = res.data.user;
					updateGrouprName(res.data.group.name);
					updateUserName(res.data.user.user_name);
					resolve(res.data.group);
				}
			);
		});
	} catch (error) {
		throw error;
	}
}

function updateUserName (name) {
    myVideo.div.firstChild.textContent = `You (${name})`;
}

function updateGrouprName(name) {
	// console.log(GroupCallName);
	for (var i = 0; i < GroupCallName.length; ++i) {
		GroupCallName[i].textContent = name;
	}
	// console.log(GroupCallName);
}

function getMessages() {
	io.socket.on("getMessage", function (res) {
		console.log("arrival message1: ", res);
		console.log(callMessageId);
		if (res.message_type == "call" && callMessageId == res.id) {
			console.log("arrival message2!: ", res);
			if (res.message == "Missed Call") {
				callStatus = "closed";
				displayMessage("missed");
			}
			if (res.message == "Call Ended") {
                let user_leave_id = res.user_leave_id;

                if (peers[user_leave_id]) {
                    peers[user_leave_id].close();
                } 
				callStatus = "closed";
				displayMessage("ended");
				// myVideo2.remove();
			}
		}
	});
}

function closeCall () {
    console.log("Close");
	if (callStatus == "in a call") {
		callStatus = "closed";
        console.log('Finish Call')
		io.socket.get(
			"/finish-group-call",
			{ msg_id: callMessageId },
			function (res) {
				endButton.style = "display: block !important";
				listOptionsBtn.style = "display: none !important";
                for (let key in peers) {
                    peers[key].close();
                }
                displayMessage("ended");
			}
		);
	} else if (callStatus == "calling") {
        console.log('Cancel Call')
		callStatus = "closed";
		io.socket.get(
			"/cancel-group-call",
			{ msg_id: callMessageId, group_id: group_id },
			function (res) {
				endButton.style = "display: block !important";
				listOptionsBtn.style = "display: none !important";
                displayMessage("ended");
			}
		);
	}
}


const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const endButton = document.querySelector("#end");
const listOptionsBtn = document.querySelector("#start");
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
    executeStopShareScreen();
    stopShareScreen();
})

function executeStopShareScreen () {
    isSharingScreen = false;
    shareScreenBtn.style = "display: flex !important";
	stopShareScreenBtn.style = "display: none !important";
}

hangUpCall.addEventListener("click", () => {
    if (isPeerSharingScreen) {
        resetShareElements()
    }
	closeCall();
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


function stopShareScreen() {
    screenSharingNotify('stop');
    myVideo.video.srcObject = myVideoStream;
    for (let [key, value] of peer._connections.entries()) {
        console.log(peer._connections.get(key)[0].peerConnection.getSenders())
        peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(myVideoStream.getTracks()[1])
    }
}

function shareScreen() {
    screenSharingNotify('share');
	navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
		const screenTrack = stream.getTracks()[0];
        currentScreeTrack = stream
        myVideo.video.srcObject = stream;
        for (let [key, value] of peer._connections.entries()) {
            peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(screenTrack) ;
        }

		screenTrack.onended = function () {
            console.log(123);
            executeStopShareScreen();
            screenSharingNotify('stop');
            for (let [key, value] of peer._connections.entries()) {
                peer._connections.get(key)[0].peerConnection.getSenders()[1].replaceTrack(myVideoStream.getTracks()[1]); 
            }
		};
	});
}

function displayMessage(name) {
	endMessage.style = "display: none !important";
	callingMessage.style = "display: none !important";
	missedMessage.style = "display: none !important";
	if (name == "ended") {
		videoGrid.classList.remove("align-items-center");
		endButton.style = "display: block !important";
		listOptionsBtn.style = "display: none !important";
		endMessage.style = "display: block !important";
	} else if (name == "missed") {
		videoGrid.classList.remove("align-items-center");
		endButton.style = "display: block !important";
		listOptionsBtn.style = "display: none !important";
		missedMessage.style = "display: block !important";
	}
}
