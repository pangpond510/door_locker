import React, { Component } from 'react';

import keyhole from '../img/key-hole.png'
import './DoorStatus.css';

class DoorStatus extends Component {
  render() {
    const { doorStatus, onLockClick } = this.props;
    return (
      <div className="door-status-outer-container">
        <div className="door-status-middle-container">
          <div onClick={onLockClick} className={`circle door ${doorStatus}`}>
            <div className={`circle inner ${doorStatus}`}></div>
            <img src={keyhole} alt="key-hole-img" className={`door-symbol ${doorStatus}`} />
          </div>
        </div>
      </div>
    );
  }
}

export default DoorStatus;
