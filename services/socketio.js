require('../config/config');

const express = require('express'),
socketio = require('socket.io'),
socketioRedis = require('socket.io-redis');

const app = express();
const port = process.env.SOCKET_PORT;
const server = app.listen(port, () => {
  console.log(`Socket.io server listening on port ${port}`);
});
const io = socketio(server);

app.use(express.static('static'));

io.adapter(socketioRedis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));
io.on('connection', (socket) => {
  socket.on('room.join', (room) => {
    console.log(socket.rooms);
    Object.keys(socket.rooms).filter((r) => r != socket.id)
      .forEach((r) => socket.leave(r));

    setTimeout(() => {
      socket.join(room);
      socket.emit('event', 'Joined room ' + room);
      socket.broadcast.to(room).emit('event', 'Someone joined room ' + room);
    }, 0);
  })

  socket.on('event', (e) => {
    socket.broadcast.to(e.room).emit('event', e.name + ' says hello!');
  });
});
