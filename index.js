require('dotenv').config();

const { EMAIL, PASSWORD, CLIENT } = process.env;
const express = require('express');
const bp = require('body-parser');
const cors = require('cors');
const SaweriaClient = require('saweria');

const client = new SaweriaClient();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: CLIENT,
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

app.use(cors({ origin: CLIENT, optionsSuccessStatus: 200 }));
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));

app.post('/fakeDonate', (req, res) => { // send fake donation
  client.sendFakeDonation();
  res.status(200).json({ message: 'hit fake donation' });
});

client.on('login', (user) => { // login saweria
  console.log('\nLogged in as: ', user.username);
});

const http = require('http');
const querystring = require('querystring');

function postToPHP(data) { // function POST to php
  const qs = querystring.stringify(data);
  const qslength = qs.length;
  const options = {
    hostname: 'localhost',
    port: 80,
    path: 'mcdingo-shop/pembayaran.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': qslength,
    },
    data: {
      item_id: qs,
    },
  };
  console.log(`post data to : ${data.username}\n`); // checking is function working properly
  const req = http.request(options);
  req.write(qs);
  req.end();
}

client.on('donations', ([{ donator, message, amount }]) => {
  io.to(message).emit('payment', { // emit console.log to header.php every transaction
    idPesanan: message,
    username: donator,
    harga: amount,
  });

  console.log('\nnew donation: ', { idPesanan: message, username: donator, harga: amount });
  postToPHP({ // POST to pembayaran.php with transaction data
    idPesanan: message,
    username: donator,
    harga: amount,
  });
  // compare between saweria and sql id invoice
});

server.listen(8000, () => {
  client.login(EMAIL, PASSWORD);
});
