const APP_ID = "APP_ID_VALUE"
let client
let channel
let localStream
let remoteStream
let peerConnection

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const constraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true
    }
}

const init = async () => {

    const token = sessionStorage.getItem('rtmToken');
    const uid = sessionStorage.getItem('rtmUID')

    console.log("Creating instance")
    client = await AgoraRTM.createInstance(APP_ID)

    console.log("Attempt to login")
    let loginComplete = true;
    await client.login({ token: token, uid: uid })
        .catch((error) => {
            loginComplete = false
        })

    if (!loginComplete) {
        window.location = 'login.html'
        return false
    }

    console.log("Creating channel")
    channel = client.createChannel('main')

    console.log("Joining")
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)
    channel.on('MemberLeft', handleUserLeft)
    client.on('MessageFromPeer', handleMessageFromPeer)

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    document.getElementById('user-1').srcObject = localStream
}

const handleUserJoined = async (memberId) => {
    createOffer(memberId)
}

const handleUserLeft = (memberId) => {
    document.getElementById('user-2').style.display = 'none'
    document.getElementById('user-1').classList.remove('small-frame')
}

const handleMessageFromPeer = async (message, memberId) => {
    message = JSON.parse(message.text)
    if (message.type === 'offer') {
        createAnswer(memberId, message.offer)
    } else if (message.type === 'answer') {
        addAnswer(message.answer)
    } else if (message.type === 'candidate') {
        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate)
        }
    }
}

const createOffer = async (memberId) => {

    await createPeerConnection(memberId)

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, memberId)
}

const createPeerConnection = async (memberId) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'inline'
    document.getElementById('user-1').classList.add('small-frame')

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, memberId)
        }
    }
}

const createAnswer = async (memberId, offer) => {

    await createPeerConnection(memberId)

    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, memberId)

}

const addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}

const leaveChannel = async () => {
    sessionStorage.removeItem('rtmToken')
    sessionStorage.removeItem('rtmUID')
    await channel.leave()
    await client.logout()
}

const toogleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video')
    if (videoTrack.enabled) {
        videoTrack.enabled = false
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        videoTrack.enabled = true
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

const toogleMic = async () => {
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio')
    if (audioTrack.enabled) {
        audioTrack.enabled = false
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        audioTrack.enabled = true
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

const closeCall = async () => {
    window.location = 'login.html'
}

document.getElementById('camera-btn').addEventListener('click', toogleCamera)
document.getElementById('mic-btn').addEventListener('click', toogleMic)
document.getElementById('leave-btn').addEventListener('click', closeCall)

window.addEventListener('beforeunload', leaveChannel)

init()