require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SaweriaClient = require('saweria');

const client = new SaweriaClient();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://127.0.0.1:5500'],
  },
});

io.on('connection', (socket) => { // socket realtime
  socket.on('persistId', ({ id, username }) => {
    socket.join(id);
    io.to(id).emit('Server Connect', {
      message: 'connected to server',
      id,
      username,
    });
  });
});

app.use(cors());
app.post('/fakeDonate', (req, res) => { // send fake donation
  client.sendFakeDonation();
  res.status(200).json({ message: 'hit fake donation' });
});

client.on('login', (user) => { // login
  console.log('Logged in as: ', user.username);
});

client.on('donations', ([{ amount, donator, message }]) => {
  io.to(message).emit('payment', {
    idPesanan: message,
    username: donator,
    harga: amount,
  });

  // compare between saweria and sql id invoice
});

const { EMAIL, PASSWORD } = process.env;

server.listen(8000, () => {
  client.login(EMAIL, PASSWORD);
});
