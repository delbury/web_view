import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageAudios extends Component {
  componentDidMount() {
    this.refs.mediabox.addEventListener('touchmove', ev => {
      if(ev.target === this.refs.mediabox) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    })
  }

  render() {
    const audio = this.props.audio;
    return (
      <div 
        className="mediabox"
        ref="mediabox"
        onClick={ev => ev.stopPropagation()}
      >
        <div className="right-icons">
          <Icon
            type="close-circle"
            onClick={this.props.onClose}
          />
        </div>
        
        <audio
          ref="audio"
          controls
          playsInline
          preload="metadata"
          volume="1"
          src={window.API_BASE_URL + audio.sourcrPath + `/${audio.sourceIndex}`}
        ></audio>
      </div>
    );
  }
}

// src={window.API_BASE_URL + audio.sourcrPath + `/${audio.sourceIndex}`}
// src={window.API_BASE_URL + audio.src}

