import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

import DoorStatus from './components/DoorStatus.js';
import NotiContainer from './components/NotiContainer.js';
import './App.css';

class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      doorStatus: 'close',
      doorList: [],
      knockList: [],
      socketEndPoint: "http://localhost:8080",
      canLock: true,
    };

    this.onLockClick = this.onLockClick.bind(this);
  }

  onLockClick() {
    if(this.state.canLock){
      if(this.state.doorStatus === "open") return;
      this.setState({
        canLock: false,
      })
      if(this.state.doorStatus === "close" || this.state.doorStatus === "unlock") {
        fetch(`http://localhost:8080/control/lock`,{method:"post"});
      }
      else if(this.state.doorStatus === "lock") {
        fetch(`http://localhost:8080/control/unlock`,{method:"post"})
      }
      setTimeout(() => {
        this.setState({
          canLock: true,
        })
      }, 2000);
    }
  }

  componentDidMount() {
    const socket = socketIOClient(this.state.socketEndPoint);
    socket.on("door-status", msg => {
      const data = JSON.parse(msg);
      let doorNext = this.state.doorStatus;
      let listNext;
      if(data.doorStatus){
        doorNext = data.doorStatus.option;
        listNext = this.state.doorList
        listNext.unshift({
          text: `the door is ${(doorNext === 'close' ? 'clos' : doorNext)}ed`,
          time: data.doorStatus.time,
          color: "blue"
        });
        this.setState({
          doorStatus: doorNext,
          doorList: listNext
        });
      }
      if(data.notification){
        listNext = this.state.knockList
        listNext.unshift({
          text: 'someone knocked your door',
          time: data.notification.time,
          color: "orange"
        });
        this.setState({
          doorStatus: doorNext,
          knockList: listNext
        });
        alert("someone knocked your door");
      }
    });
  }
  
  render() {
    return (
      <div className="app-container">
        <div className="door-status-col">
          <DoorStatus doorStatus={this.state.doorStatus} onLockClick={this.onLockClick} />
        </div>
        <div className="info-col">
          <div className="info-container">
            <p className="username-text">username: Norawit_Hempornwisarn</p>
            <p className="location-text">locaiton: Bangkok, Thailand</p>
          </div>
          <NotiContainer notiList={this.state.knockList} header="Knocking Log"/>
          <NotiContainer notiList={this.state.doorList} header="Door Log"/>
        </div>
      </div>
    );
  }
}

export default App;
