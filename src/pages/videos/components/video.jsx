import React, { Component } from 'react';
import './style/video.scss';

export default class PageImages extends Component {
  render() {
    const video = this.props.video;
    return (
      <div className="videobox">
        <video
          preload="meta"
        >
          <source src={video.sourcrPath} type="video/mp4" />
          {/* <source src={video.src} type="video/ogg" />
          <source src={video.src} type="video/webm" /> */}
        </video>
      </div>
    );
  }
}
