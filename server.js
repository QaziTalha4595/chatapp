const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const fs = require('fs');
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
    const message = {
      username: data.username,
      message: data.message,
      timestamp: new Date().getTime()
    };

    // Save the message to messages.json
    saveMessage(message);

    io.emit('message', message);

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


function saveMessage(message) {
  const filePath = __dirname + '/public/messages.json';

  // Read existing messages from the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading messages.json:', err);
      return;
    }

    let messages = [];
    try {
      messages = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing messages.json:', error);
      return;
    }

    // Add the new message to the array
    messages.push(message);

    // Write the updated messages back to the file
    fs.writeFile(filePath, JSON.stringify(messages), 'utf8', (err) => {
      if (err) {
        console.error('Error writing messages.json:', err);
      }
    });
  });
}

const port = 4595; // Specify the desired port number
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});