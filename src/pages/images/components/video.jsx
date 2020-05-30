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
      print('can play...');
    };

    // 错误
    video.onerror = ev => {
      print('video error');
      print(ev);
    }

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
          <Icon
            type="step-backward"
            onClick={() => {
              !isFirst && this.props.onBackward();
            }}
            style={{color: isFirst ? 'grey' : ''}}
          />
          <Icon
            type="step-forward"
            onClick={() => {
              !isLast && this.props.onForward();
            }}
            style={{color: isLast ? 'grey' : ''}}
          />
          <Icon type="play-circle"
            onClick={() => {
              this.refs.video.play();
            }}
          />
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
