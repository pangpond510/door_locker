import React, { Component } from 'react';

import './Noti.css';


class NotiCard extends Component {
  render() {
    const { text, time, color } = this.props;
    return (
      <div className="card">
        <div> 
          <div className={`${color} bar`} />
        </div>
        <div>
          <div className="card-text">{text}</div>
          <div className="card-text">{time}</div>
        </div>
      </div>
    );
  }
}

export default NotiCard;
