require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
const RtmTokenBuilder = require('./RtmTokenBuilder/RtmTokenBuilder2').RtmTokenBuilder
const user1 = JSON.parse(process.env.USER_1)
const user2 = JSON.parse(process.env.USER_2)
const appID = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;

app.use(express.json());
app.use(express.static('public', { index: false }))

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/login.html'))
})

app.post('/login', (req, res) => {

    let username = req.body.username
    let password = req.body.password
    let uid
    if (username === user1.username && password === user1.password) {
        uid = user1.uid
    } else if (username === user2.username && password === user2.password) {
        uid = user2.uid
    }

    if (uid) {
        const token = generateRtmToken(uid)
        res.json({ success: true, rtmToken: token, uid: uid })
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

})

app.get('*', (req, res) => {
    res.redirect('/login');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const generateRtmToken = (uid) => {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + parseInt(process.env.TOKEN_EXPIRATION_TIME_IN_SECONDS)
    const token = RtmTokenBuilder.buildToken(appID, appCertificate, uid, privilegeExpiredTs)
    return token
}
