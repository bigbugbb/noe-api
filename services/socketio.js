require('../config/config');

const express = require('express'),
socketio = require('socket.io'),
socketioRedis = require('socket.io-redis');

const db = require('../db');
const { Message } = require('../models/message');
const { Thread } = require('../models/thread');
const _ = require('lodash');
const axios = require('axios');
// const redis = require('redis'),
// client = redis.createClient();

const apiHost = 'http://localhost:3000/api/v1';
const app = express();
const port = process.env.SOCKET_PORT;
const server = app.listen(port, () => {
  console.log(`Socket.io server listening on port ${port}`);
});
const io = socketio(server);

app.use(express.static('static'));

io.adapter(socketioRedis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));

// middleware
// io.use((socket, next) => {
//   let token = socket.handshake.query.token;
//   if (isValid(token)) {
//     return next();
//   }
//   return next(new Error('authentication error'));
// });

const contact = io.of('/contact');

contact.on('connection', (socket) => {
  socket.on('join', (user, room) => {
    Object.keys(socket.rooms).filter((r) => r != socket.id)
      .forEach((r) => socket.leave(r));
    setTimeout(() => {
      socket.join(room);
      console.log(`user ${user} joined ${room}`);
    }, 0);
  });

  socket.on('add-message', async (room, token, author, target, text) => {
    try {
      const response = await axios({
        method: 'post',
        url: apiHost + '/messages',
        data: { author, target, text },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { message, thread } = response.data;
      contact.to(room).emit('message-added', message);
      contact.to(room).emit('thread-updated', thread);
    } catch (e) {
      console.error(`Error: ${e.code}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnect');
  });
});
