const mosca = require('mosca')
const express = require('express')
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt')


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


// create mosca server
const mosca_setting = {
  port: 1883,
  persistence: mosca.persistence.Memory
};
const moscaServer = new mosca.Server(mosca_setting, function() {
  console.log(`${getdate()} --> Mosca server is up and running`)
});
moscaServer.published = function(packet, client, cb) {
  if (packet.topic.indexOf('echo') === 0) {
    return cb();
  }
  const newPacket = {
    topic: 'echo/' + packet.topic,
    payload: packet.payload,
    retain: packet.retain,
    qos: packet.qos
  };
  console.log(`${getdate()} --> [MOSCA] receive newpacket\n`,newPacket);
  moscaServer.publish(newPacket, cb);
}


// create app, server, io and mqttClient
const setting = {
  apiPort : 8080,
  mqttPort : 1883
};
const app = express()
const server = http.createServer(app);
const io = socketIo(server);
const mqttClient = mqtt.connect(`mqtt://localhost:${setting.mqttPort}`,{clientId: "door_locker_server"});


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

    // publish message to MQTT client
    mqttClient.publish('door_locker_server', doorStatus); 
    console.log(`${getdate()} --> [MQTT] sending door status to nodeMCU`);
    
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


// setup mqttClient
mqttClient.subscribe('door_locker_nodeMCU');
mqttClient.on('message', (topic, message) => {
  if(topic.toString() === 'door_locker_nodeMCU'){
    const msg = message.toString();
    console.log(`${getdate()} --> [MQTT] receiving message - ${msg}`);
    if(msg === 'open' || msg === 'close' || msg === 'unlock' || msg === 'lock'){
      if(doorStatus === 'lock' && msg === 'close') msg = 'unlock';
      if(doorStatus === 'open' && msg === 'unlock') msg = 'close';
      doorStatus = msg;
      console.log(`${getdate()} --> [MQTT] the door is ${(msg === 'close' ? 'clos' : msg)}ing`);
      emit_socket_door();
    }
    else if(msg === 'noti'){
      emit_socket_noti();
    }
  }
});
console.log(`${getdate()} --> starting MQTT client and subscribing to "door_locker"`);


// listen
server.listen(setting.apiPort, '0.0.0.0', () => console.log(`${getdate()} --> listening on port ${setting.apiPort}`))