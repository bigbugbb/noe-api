require('../config/config');

const express = require('express'),
socketio = require('socket.io'),
socketioRedis = require('socket.io-redis');

// const redis = require('redis'),
// client = redis.createClient();

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

  socket.on('message', (from, to, message) => {
    contact.to(to).emit('message', from, message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnect');
  });
});
