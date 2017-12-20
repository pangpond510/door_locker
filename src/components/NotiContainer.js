import React, { Component } from 'react';

import NotiCard from './NotiCard.js';
import './Noti.css';

class NotiContainer extends Component {
  render() {
    const { notiList, header } = this.props;
    return (
      <div className="card-container">
        <div className="card-header">
          {header}
        </div>
        <div className="card-list"> 
        {
          notiList.map((e,i) => {
            return (
              <NotiCard key={i} text={e.text} time={e.time} color={e.color} />
            )
          })
        }
        </div>
      </div>
    );
  }
}

export default NotiContainer;
