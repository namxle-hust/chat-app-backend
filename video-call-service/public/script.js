
// window.open(`http://google.com`,"Video Call","menubar=0");

// var newTab = window.open(url, 'windowNameHehe', , false);
// newTab.focus();

const videoGrid = document.getElementById("video-self");
const videoPartner = document.getElementById("video-partner");
const myVideo = document.createElement("video");
const myVideo2 = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
myVideo2.muted = true;

var peerId;

var peer = new Peer(undefined, {
	path: "/peerjs",
	host: "localhost",
	port: "9090",
});

peer.on("open", (id) => {
	peerId = id;
});


io.sails.url = 'http://localhost:6003';
io.sails.useCORSRouteToGetCookie = false;
io.sails.query = `token=${user_token}`;

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream);
	call.on("stream", (userVideoStream) => {
        addVideoStream2(myVideo2, userVideoStream);
	});
};


let calling = () => {
    console.log("Calling");
    io.socket.get('/call', { recvId: user_id } ,function (res) {
        // if (res.status === 'success') setConnectSocketSuccess(true);
    })
}

let answer = () => {
    console.log("Answering");
    let data = {
        response: 'accept',
        user_recv_id: user_id,
        peer_id: peerId,
        msg_id: call_id
    }
    io.socket.get('/answer-call', data ,function (res) {
        
    })
}

io.socket.on('getMessage', function (res) {
    console.log(res);
    if (res.message_type == 'call') {
        console.log('arrival message !: ', res);
    }
})

io.socket.get('/subscribe', function (res) {  // subscibe to socket server realtime
    console.log(res);
    if (res.status === 'success') {
        console.log('connect socket successfully !');
        if (status == 'calling') {
            calling();
        } else {
            answer();
        }
    } else {
        console.log("Socket error");
    }
})

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
			call.answer(stream);
			call.on("stream", (userVideoStream) => {
				addVideoStream2(myVideo2, userVideoStream);
			});
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
}

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
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


