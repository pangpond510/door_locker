#include<ESP8266WiFi.h>
#include<PubSubClient.h>
#include<stdlib.h>

const char* ssid = "oppo_f1";
const char* password = "12345678";
const IPAddress mqtt_server(192, 168, 43, 195);
const int mqtt_port = 1883;
 
WiFiClient espClient;
PubSubClient client(espClient); 

void callback(char* topic, byte* payload, unsigned int len){
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  char chArray[len+1];
  for (int i=0;i<len;i++) {
    chArray[i] = (char)payload[i];
  }
  chArray[len] = '\0';
  String s(chArray);
  // receive data from webpage
  // if s = lock --> tell STM32 to lock the door
  // if s = unlock --> tell STM32 to unlock the door
  Serial.println(s);
}

void connect_wifi(){
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while(WiFi.status()!= WL_CONNECTED){
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.println("WiFi connected");
}

void connect_mqtt(){
  Serial.println("Attempting MQTT connection");
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  while (!client.connected()) {
    Serial.print(".");
    if(client.connect("door_locker_nodeMCU")){
      client.subscribe("door_locker_server");
    }
    else{
      delay(500);
    }
  }
  Serial.println();
  Serial.println("MQTT connected");
}
 
void setup(){
  Serial.begin(9600);
}
 
void loop(){
  if(WiFi.status() != WL_CONNECTED) {
    connect_wifi();
  }
  if(!client.connected()) {
    connect_mqtt();
  }
  client.loop();
  if(Serial.available()){
    String s = Serial.readString();
    // send data to webpage
    // if s = open --> tell webpage that the door is opened (cannot lock)
    // if s = close --> tell webpage that the door is closeed
    // if s = noti --> tell webpage that someone knock the door
    int len = s.length()+1;
    char buff[len];
    s.toCharArray(buff, len);
    client.publish("door_locker_nodeMCU",buff);
  }
}

