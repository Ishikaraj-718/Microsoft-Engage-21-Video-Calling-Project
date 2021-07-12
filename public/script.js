const Username=prompt("Enter your name to join");       
$("ol").append(`<li class="Participants"><b>${Username} connected</b></li>`)
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer=new Peer();
let myVideoStream;
let currentPeer;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    
        call.answer(stream)
        const video = document.createElement('video')
        
      call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
            currentPeer=call.peerConnection;
          })
         
  })

  socket.on('user-connected', (userId,username)=> {
    $("ol").append(`<li class="Participants"><b>${username} connected</b></li>`)
    connectToNewUser(userId, stream, username)
  })
  
 
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", (message, username )=> {
  
    $("ul").append(`<li class="message"><b>${username}</b><br/>${message}</li>`);
    scrollToBottom()
  })
}).catch(err=>{
  alert("unable to get user media"+err);
})

socket.on('user-disconnected', (userId,username) => {
 
  if (peers[userId]) peers[userId].close()
  
})
 
myPeer.on('open', (id)=> {
  socket.emit('join-room', ROOM_ID, id,Username)
  
})

function connectToNewUser(userId, stream, username) {
  console.log("new user")
  console.log(username)
 
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    currentPeer=call.peerConnection;
    
  })
  call.on('close', () => {
    

    video.remove()
  })

  peers[userId] = call
}


function addVideoStream(video, stream) {                    // add video to the grid
  
  video.srcObject = stream                      
  OutlineBorder(video);
  video.addEventListener('loadedmetadata', () => {
    video.play()
  
  })
  videoGrid.append(video)
        
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {                                   
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {                                       
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span></span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span></span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span></span>
  `
  
  document.querySelector('.main__video_button').innerHTML = html;
  
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span></span>
  `
  
  document.querySelector('.main__video_button').innerHTML = html;
  
}

const leave=document.getElementsByClassName("leave_meeting")

function Leave(){
  leave.setAttribute("formaction","/leavepage");
}

//ScreeSharing Part

var initiateBtn = document.getElementById('initiateBtn');

var initiator = false;
'use strict';

if (adapter.browserDetails.browser == 'firefox') {
  adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}

initiateBtn.onclick = (e) => {
  initiator = true;
  initiateBtn.style.display = 'none';
  stopBtn.style.display = 'block';
  startStream();
}


stopBtn.onclick = (e) => {
  initiator=false;
  initiateBtn.style.display = 'block';
  stopBtn.style.display = 'none';  
  stopScreenShare();
}



function startStream () {
  if (initiator) {
    // get screen stream
    navigator.mediaDevices.getDisplayMedia({
      video: true
    }).then((stream)=>{
      if (initiator) {
      //  socket.emit('initiate',stream);
        let videoTrack= stream.getVideoTracks()[0];
        videoTrack.onended=function(){
          stopScreenShare();
        }
        let sender = currentPeer.getSenders().find(function(s){
          return s.track.kind == videoTrack.kind
        })
        sender.replaceTrack(videoTrack)
      
      }

    }).catch((err)=>{
      alert("unable to get display media"+err);
    })
  } 
}

function stopScreenShare(){
  let videoTrack = myVideoStream.getVideoTracks()[0];
  var sender = currentPeer.getSenders().find(function(s){
     return s.track.kind == videoTrack.kind;
  })
  sender.replaceTrack(videoTrack);
};

  
//chat box toggle
  

  var chat_box=document.getElementById("chat_box");

  function chat__show(){
    
    if (chat_box.style.display === "none") {
      chat_box.style.display = "block";
    } else {
      chat_box.style.display = "none";
    }
  }

  function chat__hide(){
    chat_box.style.display="none";
  }




  if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    stopBtn.disabled = false;
  }



function OutlineBorder(video) {
  video.addEventListener('mouseenter',()=>{
    video.style.outline= "thick solid #0000FF";
  })
  video.addEventListener('mouseleave',()=>{
    video.style.outline= "thick solid black";
    
  })

}

//popup participants status

function Show_Add_participants(){
  
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }

  function Share(){                                    //share teamid to others
  
    var share = document.getElementById("Share");
    share.classList.toggle("show");
  }

  function copyToClip(str) {
    function listener(e) {
      e.clipboardData.setData("text/html", str);
      e.clipboardData.setData("text/plain", str);
      e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
  };
  