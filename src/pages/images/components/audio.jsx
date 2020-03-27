import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageAudios extends Component {
  handleTouchMove = ev => {
    ev.stopPropagation();
  }
  render() {
    const audio = this.props.audio;
    return (
      <div className="mediabox"
        onTouchMove={this.handleTouchMove}
        onClick={ev => ev.stopPropagation()}
      >
        <Icon
          type="close-circle"
          onClick={this.props.onClose}
        />
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
