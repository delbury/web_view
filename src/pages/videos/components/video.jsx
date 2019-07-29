import React, { Component } from 'react';
import './style/video.scss';

export default class PageImages extends Component {
  render() {
    const video = this.props.video;
    return (
      <div className="videobox">
        <video
          // preload="metadata"
          poster={window.API_BASE_URL + video.posterPath}
          controls
          playsInline
          // poster="/test-sources/1.jpg"
          src={window.API_BASE_URL + video.sourcrPath}
          type="video/mp4"
        ></video>
      </div>
    );
  }
}
