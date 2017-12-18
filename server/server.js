const express = require('express')
const http = require('http');
const socketIo = require('socket.io');


// define variables and functions
let doorStatus = 'close';
const twodigit = (n) => {
  return n<10 ? '0'+n : n;
}
const getdate = () => {
  let currentdate = new Date(); 
  let datetime =  '@ '
                  + twodigit(currentdate.getHours()) + ':'  
                  + twodigit(currentdate.getMinutes()) + ':' 
                  + twodigit(currentdate.getSeconds());
  
  return datetime;
}


// create app, server, io 
const setting = {
  apiPort : 8080,
};
const app = express()
const server = http.createServer(app);
const io = socketIo(server);


// define emit function for socket
const emit_socket_door = () => {
  const msg = {
    doorStatus: {
      option : doorStatus,
      time : getdate()
    }
  }
  io.sockets.emit('door-status', JSON.stringify(msg));
  console.log(`${getdate()} --> [SOCKET] sending door status to webpage`);
}

const emit_socket_noti = () => {
  const msg = {
    notification: {
      time : getdate()
    }
  }
  io.sockets.emit('door-status', JSON.stringify(msg));
  console.log(`${getdate()} --> [SOCKET] sending notification alert to webpage`);
}


// allow CORS
app.use( (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// create routes for API
app.post('/control/:option', (req, res) => {
  const opt = req.params.option;
  if(opt === 'open' || opt === 'close' || opt === 'unlock' || opt === 'lock'){
    if(doorStatus === 'lock' && opt === 'close') opt = 'unlock';
    if(doorStatus === 'open' && opt === 'unlock') opt = 'close';
    doorStatus = opt;
    console.log(`${getdate()} --> [API] the door is ${(opt === 'close' ? 'clos' : opt)}ing`);

    // emit message to socket.io client
    emit_socket_door();

    res.send('valid');
  }
  else res.send('invalid');
})
app.post('/noti', (req, res) => {
  // emit message to socket.io client
  emit_socket_noti();
})
app.get('/getstatus', (req, res) => {
  let msg = {
    'status' : doorStatus,
  }
  res.send(msg);
  console.log(`${getdate()} --> [API] sending door status`);
})


// setup socket.io
io.on('connection', socket => {
  console.log(`${getdate()} --> [SOCKET] new client connected`); 
  emit_socket_door();
  console.log(`${getdate()} --> [SCOKET] sending initial door status`);
  socket.on('disconnect', () => console.log(`${getdate()} --> [SOCKET] client disconnected`));
});


// listen
server.listen(setting.apiPort, '0.0.0.0', () => console.log(`${getdate()} --> listening on port ${setting.apiPort}`))