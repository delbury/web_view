import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageAudios extends Component {
  handleTouchMove = ev => {
    ev.stopPropagation();
    ev.preventDefault();
  }

  componentDidMount() {
    this.refs.mediabox.addEventListener('touchmove', ev => {
      ev.stopPropagation();
      ev.preventDefault();
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
          controls
          playsInline
          src={window.API_BASE_URL + audio.src}
          preload="metadata"
          volume="1"
        ></audio>
      </div>
    );
  }
}
