#include<ESP8266WiFi.h>
#include<PubSubClient.h>
#include<stdlib.h>
#include <SoftwareSerial.h>

#define rxPin 13
#define txPin 15

#define lockPin 5
#define unlockPin 4
const char* ssid = "oppo_f1";
const char* password = "12345678";
const IPAddress mqtt_server(192, 168, 43, 196);
const int mqtt_port = 1883;
 
WiFiClient espClient;
PubSubClient client(espClient); 
SoftwareSerial sSerial(rxPin, txPin);

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
  if(s == "lock"){
    digitalWrite(lockPin, HIGH);
    delay(2000);      
    digitalWrite(lockPin, LOW);
  }
  else if(s == "unlock"){
    digitalWrite(unlockPin, HIGH);
    delay(2000);      
    digitalWrite(unlockPin, LOW);
  }
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
  pinMode(rxPin, INPUT);
  pinMode(txPin, OUTPUT);
  pinMode(lockPin, OUTPUT);
  pinMode(unlockPin, OUTPUT);
  Serial.begin(9600);
  sSerial.begin(9600);
}
 
void loop(){
  if(WiFi.status() != WL_CONNECTED) {
    connect_wifi();
  }
  if(!client.connected()) {
    connect_mqtt();
  }
  client.loop();

  int count = 0;
  bool check = false;
  char serialBuffer[64];
  while (sSerial.available() > 0) {
    serialBuffer[count] = sSerial.read();
    count++;
    check = true;
  }
  serialBuffer[count] = '\0';
  if(check){
    client.publish("door_locker_nodeMCU",serialBuffer);
  }
}

