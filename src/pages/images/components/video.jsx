import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageVideos extends Component {
  handleTouchMove = ev => {
    ev.stopPropagation();
  }
  render() {
    const video = this.props.video;
    return (
      <div className="mediabox"
        onTouchMove={this.handleTouchMove}
        onClick={ev => ev.stopPropagation()}
      >
        <Icon
          type="close-circle"
          onClick={this.props.onClose}
        />
        <video
          poster={window.API_BASE_URL + video.posterPath}
          controls
          playsInline
          src={window.API_BASE_URL + video.sourcrPath}
          type="video/mp4"
          preload="metadata"
        ></video>
      </div>
    );
  }
}
