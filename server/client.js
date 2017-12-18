var mqtt = require('mqtt')

const client = mqtt.connect("mqtt://localhost:1883",{clientId: "client_test"});

client.subscribe('door_locker_server');
client.on('message', (topic, message) => {
  if(topic.toString() === 'door_locker_server') console.log(message.toString());
});

console.log('Client started...');