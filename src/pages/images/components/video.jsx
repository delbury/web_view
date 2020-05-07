import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageVideos extends Component {
  handleTouchMove = ev => {
    ev.stopPropagation();
  }

  componentDidMount() {
    const video = this.refs.video;

    // 可以播放
    video.oncanplay = ev => {
      video.play();
    };

    // 播放结束
    video.onended = ev => {
      this.props.onEnded();
    };
  }

  render() {
    const { video, isFirst, isLast } = this.props;

    return (
      <div className="mediabox"
        onTouchMove={this.handleTouchMove}
        onClick={ev => ev.stopPropagation()}
      >
        <div className="icon-box">
          {
            !isFirst ? <Icon
              type="step-backward"
              onClick={this.props.onBackward}
            /> : ''
          }
          {
            !isLast ? <Icon
              type="step-forward"
              onClick={this.props.onForward}
            /> : ''
          }
          <Icon
            type="close"
            onClick={this.props.onClose}
          />
        </div>
        
        <video
          poster={window.API_BASE_URL + video.posterPath}
          controls
          playsInline
          src={window.API_BASE_URL + video.sourcrPath}
          type="video/mp4"
          preload="metadata"
          ref="video"
        ></video>
      </div>
    );
  }
}
