const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
app.use(express.static(__dirname + '/public'));
const io = socketIO(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
  });


io.on('connection', (socket) => {
  console.log('New user connected');

  // Handle user join event
  socket.on('join', (username) => {
    console.log(`${username} joined the chat`);
    socket.username = username;
    socket.broadcast.emit('message', {
      username: 'Server',
      message: `${username} joined the chat`
    });
  });

  // Handle new message event
  socket.on('message', (data) => {
    io.emit('message', {
      username: data.username,
      message: data.message
    });
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log(`${socket.username} left the chat`);
    socket.broadcast.emit('message', {
      username: 'Server',
      message: `${socket.username} left the chat`
    });
  });
});


const port = 3000; // Specify the desired port number
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});