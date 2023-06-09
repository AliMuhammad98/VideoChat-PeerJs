const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

//const user = prompt("Enter your name");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const user = urlParams.get("username");
console.log("Username",user)
const callStartTime = new Date();

var peer = new Peer({
  host: '127.0.0.1',
  port: 9000,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },

  debug: 3
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo,stream,'myVideo');
    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream,'remoteVideo');
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream,'remoteVideo');
  });
};

peer.on("open", (id) => {
  console.log('my id is' + id,user);
  socket.emit("join-room", ROOM_ID, id, user);
});

peer.on('disconnected', () => {
  console.log("My loggggg")
  // Do something when connection is closed
  socket.emit("callEnded",undefined)
});

socket.on('call-ended',(userId)=>{
   console.log("UserId",userId)
   peer.destroy()
   const video=document.getElementById("remoteVideo").remove()
})

window.addEventListener('beforeunload', function(event) {
  // Call a function to handle the "disconnect" event
  peer.destroy()
  const video=document.getElementById("remoteVideo").remove()
});


const addVideoStream = (video, stream,ID) => {
  video.srcObject = stream;
  video.setAttribute('id',ID);
  video.addEventListener("loadedmetadata", () => {
    console.log("Running Adding Media Stream")
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const endCall=document.querySelector("#endCallButton")

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

//TODO Right logic for disconnect call
endCall.addEventListener("click",()=>{
  html = `<i class="fas fa-unlink"></i>`;
  endCall.classList.toggle("background__red");
  endCall.innerHTML = html;
  const callEndTime = new Date();
  // Calculate the total time between the call initiation and termination
  const callDuration = callEndTime.getTime() - callStartTime.getTime();
  // Log the call duration in seconds
  console.log(`Call duration: ${Math.floor(callDuration / 60000)} minutes`);
  peer.destroy()
  // if (!videoGrid || !myVideo) {
  //   console.error('Could not find video elements');
  //   return;
  // }
  // if (myVideo.parentNode !== videoGrid) {
  //   console.error('User video element is not a child of the video container');
  //   return;
  // }
  // videoGrid.removeChild(myVideo);
})

const url = new URL('http://localhost:3030/1122?username=Ali');
const path = url.pathname.replace(/\/\w+$/, '/index');
const result = url.origin + path;
console.log("Result",result)
console.log(result); // Output: http://localhost:3030/index
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    result
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});
