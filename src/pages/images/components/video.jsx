import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';
import { timeToString } from '../../../libs/util';

export default class PageVideos extends Component {
  constructor() {
    super();
    this.state = {
      paused: true,
      rateIndex: 0,
      showCtrls: true,
      timer: null,
      videoStyle: {
        rotate: 0,
        width: '',
        height: '',
        maxWidth: '',
        maxHeight: ''
      },
      toastMsg: ''
    };

    this.rateList = [1.0, 1.5, 2.0];
  }

  handleTouchMove = ev => {
    ev.stopPropagation();
  }

  componentDidMount() {
    const video = this.refs.video;

    // 播放事件
    video.onplaying = ev => {
      this.onRotate(0);
    }

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

    // 开始拖动
    video.ontouchstart = ev => {
      if(this.state.videoStyle.rotate === 0 || this.state.videoStyle.rotate === 180) {
        this._startTouce = ev.touches[0].clientX;
      } else {
        this._startTouce = ev.touches[0].clientY;
      }
    }

    // 拖动中
    video.ontouchmove = ev => {
      const step = 3;
      if(this.state.videoStyle.rotate === 0) {
        this._offsetTouce = (ev.touches[0].clientX - this._startTouce) / step;
      } else if(this.state.videoStyle.rotate === 180) {
        this._offsetTouce = -(ev.touches[0].clientX - this._startTouce) / step;
      } else if(this.state.videoStyle.rotate === 90) {
        this._offsetTouce = (ev.touches[0].clientY - this._startTouce) / step;
      } else if(this.state.videoStyle.rotate === 270) {
        this._offsetTouce = -(ev.touches[0].clientY - this._startTouce) / step;
      }

      this.setState({
        toastMsg: `${timeToString(this._offsetTouce)}`
      });
    }

    // 拖动结束
    video.ontouchend = ev => {
      this.setState({
        toastMsg: ''
      });
      if(this._offsetTouce) {
        this.refs.video.currentTime += this._offsetTouce;
        this._startTouce = null;
        this._offsetTouce = null;
      }
    }

    this.refreshTimer(this.refs.toolbar);

    this.setState({
      paused: video.paused
    });
  }

  // 旋转
  onRotate(rotateDeg = 0) {
    const video = this.refs.video;
    const { clientWidth, clientHeight } = video;
    const rotate = this.state.videoStyle.rotate;
    const deg = (rotate + rotateDeg + 360) % 360;
    let scale = null;
    let maxWidth = '';
    let maxHeight = '';

    if((deg % 180) !== 0) {
      const scaleW = (document.documentElement.offsetWidth || document.body.offsetWidth) / clientHeight;
      const scaleH = (document.documentElement.offsetHeight || document.body.offsetHeight) / clientWidth;
      scale = Math.min(scaleW, scaleH);
      maxWidth = 'unset';
      maxHeight = 'unset';
    } else {
      maxWidth = '';
      maxHeight = '';
    }

    // 更新
    this.setState({
      videoStyle: {
        rotate: deg,
        height: scale ? `${clientHeight * scale}px` : '',
        width: scale ? `${clientWidth * scale}px` : '',
        maxWidth,
        maxHeight
      }
    })
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
    const { width, height, rotate, maxWidth, maxHeight } = this.state.videoStyle;
    const toastMsg = this.state.toastMsg;
    return (
      <div
        className="mediabox"
        onTouchMove={this.handleTouchMove}
        onClick={ev => ev.stopPropagation()}
        onMouseMove={ev => this.refreshTimer(this.refs.toolbar)}
        onTouchStart={ev => this.refreshTimer(this.refs.toolbar)}
      >
        <div ref="toolbar" className={`icon-box ${this.state.showCtrls ? '' : 'hidden'}`}>
          <div className="row">
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
                  // this.props.onBackward();
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
                  // this.props.onForward();
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
              onClick={() => {
                this.setState({
                  videoStyle: {
                    rotate: 0,
                    width: '',
                    height: '',
                    maxWidth: '',
                    maxHeight: ''
                  }
                });
                this.props.onClose();
              }}
            />
          </div>
          </div>
          <div className="row">
            <div className="left"></div>
            <div className="right">
              {/* 顺时针 */}
              <Icon type="redo" 
                onClick={() => {
                  this.onRotate(90);
                }}
              />

              {/* 逆时针 */}
              <Icon type="undo" 
                onClick={() => {
                  this.onRotate(-90);
                }}
              />
            </div>
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
          style={{
            transform: `rotate(${rotate}deg)`,
            width,
            height,
            maxWidth,
            maxHeight
          }}
        ></video>
        {
          !!toastMsg ?
            <div className="toast" style={{
              transform: `rotate(${rotate}deg)`,
            }}>
              { toastMsg }
            </div>: ''
        }
      </div>
    );
  }
}
