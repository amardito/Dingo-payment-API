require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SaweriaClient = require('saweria');

const client = new SaweriaClient();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost'],
  },
});

io.on('connection', (socket) => { // socket realtime
  socket.on('persistId', ({ id, username }) => {
    console.log('\nIDpayment connect : ', id);
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
  console.log('\nLogged in as: ', user.username);
});

client.on('donations', ([{ donator, message, amount }]) => {
  const qString = JSON.stringify({ donator, message, amount });

  // const options = {
  //   hostname: 'example.com',
  //   port: 80,
  //   path: 'some.php',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Content-Length': `${qString.length}`,
  //   },
  // };

  const options = {
    url: 'http://www.usefulangle.com',
    port: '80',
    path: '/post/ajax.php',
    method: 'POST',
  };
  let buffer = '';
  const req = app.request(options, (res) => {
    res.on('data', (chunk) => {
      buffer += chunk;
    });
    res.on('end', () => {
      console.log(buffer);
    });
  });

  req.write(qString);
  req.end();

  console.log(`\nnew donation from : ${donator} | invoice : ${message} | amount : ${amount}`);
  // io.to(message).emit('payment', {
  //   idPesanan: message,
  //   username: donator,
  //   harga: amount,
  // });

  // compare between saweria and sql id invoice
});

const { EMAIL, PASSWORD } = process.env;

server.listen(8000, () => {
  client.login(EMAIL, PASSWORD);
});
