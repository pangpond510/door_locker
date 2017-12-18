import React, { Component } from 'react';

import NotiCard from './NotiCard.js';
import './Noti.css';

class NotiContainer extends Component {
  render() {
    const { notiList } = this.props;
    return (
      <div className="card-container">
        {
          notiList.map((e,i) => {
            return (
              <NotiCard key={i} text={e.text} time={e.time} color={e.color} />
            )
          })
        }
      </div>
    );
  }
}

export default NotiContainer;
