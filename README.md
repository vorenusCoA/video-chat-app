# video-chat-app
This is a peer-to-peer video chat app (support only for 2 users) built with WebRTC, Agora, NodeJS, Express and Vanilla JS

The frontend and WebRTC configuration using Agora is based on this tutorial: https://www.youtube.com/watch?v=QsH8FL0952k

## Requirements
- [Node](https://nodejs.org/en)
- [Agora](https://www.agora.io/en/) account

## Instructions
- Clone the repo
- From the root directory execute: `npm install`
- Create a project in Agora and grab the `APP_ID` and the `CERTIFICATE`
- In the root directory create a new file called `.env`
  - Complete the missing values with your information:
  ```
  USER_1={ "username": "", "password": "", "uid": "123" }
  USER_2={ "username": "", "password": "", "uid": "456" }
  APP_ID=""
  APP_CERTIFICATE=""
  TOKEN_EXPIRATION_TIME_IN_SECONDS="3600"
  ```
  - APP_ID and APP_CERTIFICATE come from the Agora project
- In the `public/js/main.js` file replace the `APP_ID_VALUE` with the APP_ID from the Agora project
- Run the server: `nodemon server.js`
- Access `localhost:3000` and login with USER_1 credentials
- Open a new tab and access to `localhost:3000` but login with USER_2



