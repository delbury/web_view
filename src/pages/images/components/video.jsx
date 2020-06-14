import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';

export default class PageVideos extends Component {
  constructor() {
    super();
    this.state = {
      paused: true,
      rateIndex: 0,
      showCtrls: true,
      timer: null
    };

    this.rateList = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  }

  handleTouchMove = ev => {
    ev.stopPropagation();
  }

  componentDidMount() {
    const video = this.refs.video;

    // 可以播放
    video.oncanplay = ev => {
      video.playbackRate = this.rateList[this.state.rateIndex];
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

    // 开始播放
    video.onplay = ev => {
      this.setState({ paused: false });
    };

    // 暂停
    video.onpause = ev => {
      this.setState({ paused: true });
    };

    this.refreshTimer(this.refs.toolbar);

    this.setState({
      paused: video.paused
    });
  }

  // 设置定时器
  refreshTimer(ele) {
    ele.classList.remove('hidden');
    setTimeout(() => {
      ele.classList.remove('fade');
    }, 0);
    if(this.state.timer) {
      window.clearTimeout(this.state.timer);
      // this.setState({ timer: null });
    }
    this.setState({
      timer: window.setTimeout(() => {
        ele.classList.add('fade');
        ele.ontransitionend = ev => {
          ele.classList.add('hidden');
          ele.ontransitionend = null;
        };
        this.setState({ timer: null });
      }, 3000)
    });
  }

  componentWillUnmount() {
    if(this.state.timer) {
      window.clearTimeout(this.state.timer);
      this.setState({ timer: null });
    }
    this.setState = () => false;
  }

  render() {
    const { video, isFirst, isLast } = this.props;
    const paused = this.state.paused;
    const rateIndex = this.state.rateIndex;
    return (
      <div
        className="mediabox"
        onTouchMove={this.handleTouchMove}
        onClick={ev => ev.stopPropagation()}
        onMouseMove={ev => this.refreshTimer(this.refs.toolbar)}
        onTouchStart={ev => this.refreshTimer(this.refs.toolbar)}
      >
        <div ref="toolbar" className={`icon-box ${this.state.showCtrls ? '' : 'hidden'}`}>
          <div className="left">
            <Icon
              type="minus-circle"
              onClick={() => {
                if(rateIndex > 0) {
                  this.refs.video.playbackRate = this.rateList[rateIndex - 1]
                  this.setState({ rateIndex: rateIndex - 1 });
                }
              }}
              style={{color: rateIndex > 0 ? '' : 'grey'}}
            />
            <i className="text"
              onClick={() => {
                const tempIndex = this.state.rateIndex + 1;
                if(tempIndex >= this.rateList.length) {
                  this.refs.video && (this.refs.video.playbackRate = this.rateList[0])
                  this.setState({ rateIndex: 0 });
                } else {
                  
                }
              }}
            ><span>x{this.rateList[rateIndex].toFixed(1)}</span></i>
            <Icon
              type="plus-circle"
              onClick={() => {
                if(rateIndex < this.rateList.length - 1) {
                  this.refs.video.playbackRate = this.rateList[rateIndex + 1]
                  this.setState({ rateIndex: rateIndex + 1 });
                }
              }}
              style={{color: rateIndex < this.rateList.length - 1 ? '' : 'grey'}}
            />
          </div>
          <div className="right">
            {/* <Icon
              type="fullscreen"
              onClick={() => {
                this.refs.video && this.refs.video.requestFullscreen();
              }}
            /> */}
            <Icon
              type="left-circle"
              onClick={() => {
                if(!isFirst) {
                  this.props.onBackward();
                  this.props.onBackward(() => {
                    if(!this.state.paused) {
                      this.refs.video.play();
                    }
                  });
                  // this.setState({ paused: true });
                }
              }}
              style={{color: isFirst ? 'grey' : ''}}
            />
            <Icon
              type="right-circle"
              onClick={() => {
                if(!isLast) {
                  this.props.onForward();
                  this.props.onForward(() => {
                    if(!this.state.paused) {
                      this.refs.video.play();
                    }
                  });
                  // this.setState({ paused: true });
                }
              }}
              style={{color: isLast ? 'grey' : ''}}
            />
            {
              paused ? <Icon type="play-circle"
                onClick={() => {
                  this.refs.video && this.refs.video.play();
                }}
              /> :
              <Icon type="pause-circle"
                onClick={() => {
                  this.refs.video && this.refs.video.pause();
                }}
              />
            }
            <Icon
              type="close-circle"
              onClick={this.props.onClose}
            />
          </div>
        </div>
        
        <video
          poster={window.API_BASE_URL + video.posterPath + `/${video.sourceIndex}`}
          controls
          playsInline
          src={window.API_BASE_URL + video.sourcrPath + `/${video.sourceIndex}`}
          type="video/mp4"
          preload="metadata"
          ref="video"
        ></video>
      </div>
    );
  }
}
