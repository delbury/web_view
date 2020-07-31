import React, { Component } from 'react';
import { Icon } from 'antd';
import './style/media.scss';
import LrcParser from '../../../libs/lrc-parser';

export default class PageAudios extends Component {
  constructor() {
    super();
    this.state = {
      lrcs: [], // 歌词
      currentIndex: 0, // 当前的歌词
      paused: true,
      rateIndex: 1,
      lrcBoxHalfHeight: 0,
      lockLrc: false, // 是否锁定歌词不滚动
    };
    this.lp = new LrcParser();
    this.rateList = [0.5, 1.0, 1.5, 2.0];
  }

  componentDidMount() {
    const lrcBoxHalfHeight = this.refs.lrcBox.getBoundingClientRect().height / 2;
    this.setState({ lrcBoxHalfHeight });

    const audio = this.refs.audio;
    audio.ontimeupdate = ev => {
      const res = this.lp.lyricGenerator(ev.target.currentTime);
      if(res.changed) {
        const ele = document.querySelector(`.lrc-line[data-key="${res.index}"]`);
        if(!ele) {
          return;
        }
        const offsetTop = ele.offsetTop;
        if(offsetTop > lrcBoxHalfHeight) {
          if(!this.state.lockLrc) {
            this.refs.lrcBox.scrollTo({
              top: offsetTop - lrcBoxHalfHeight,
              behavior: 'smooth'
            });
          }
          this.setState({
            currentIndex: res.index,
          });
        }
      }
    };

    // 可以播放
    audio.oncanplay = ev => {
      audio.playbackRate = this.rateList[this.state.rateIndex];
      audio.play();
      print('can play...');
    };

    // 错误
    audio.onerror = ev => {
      print('audio error');
      print(ev);
    }

    // 播放结束
    audio.onended = ev => {
      this.setState({ paused: true });
    };

    // 开始播放
    audio.onplay = ev => {
      this.setState({ paused: false });
    };

    // 暂停
    audio.onpause = ev => {
      this.setState({ paused: true });
    };
  }

  componentWillMount() {
    const audio = this.props.audio;
    if(audio && audio.lrcPath) {
      this.lp.readRemoteFile(window.API_BASE_URL + audio.lrcPath).then(res => {
        if(res) {
          this.setState({
            lrcs: res.lyrics
          })
        }
      });
    }
  }

  componentWillUnmount() {
    this.setState = () => false;
  }

  // 歌词移动
  eventTouchstartLrcBox = ev => {
    this.setState({
      lockLrc: true
    })
  }
  eventTouchendLrcBox = ev => {
    this.setState({
      lockLrc: false
    })
  }

  render() {
    const audio = this.props.audio;
    const { currentIndex, rateIndex, paused, lrcBoxHalfHeight } = this.state;
    const lrcMaxIndex = this.state.lrcs.length - 1;
    return (
      <div 
        className="mediabox"
        ref="mediabox"
        onClick={ev => ev.stopPropagation()}
      >
        <div className="icon-box">
          <div className="row">
            <div className="left">
              <Icon
                type="minus-circle"
                onClick={() => {
                  if(rateIndex > 0) {
                    this.refs.audio.playbackRate = this.rateList[rateIndex - 1]
                    this.setState({ rateIndex: rateIndex - 1 });
                  }
                }}
                style={{color: rateIndex > 0 ? '' : 'grey'}}
              />
              <i className="text"
                onClick={() => {
                  const tempIndex = this.state.rateIndex + 1;
                  if(tempIndex >= this.rateList.length) {
                    this.refs.audio && (this.refs.audio.playbackRate = this.rateList[0])
                    this.setState({ rateIndex: 0 });
                  } else {
                    
                  }
                }}
              ><span>x{this.rateList[rateIndex].toFixed(1)}</span></i>
              <Icon
                type="plus-circle"
                onClick={() => {
                  if(rateIndex < this.rateList.length - 1) {
                    this.refs.audio.playbackRate = this.rateList[rateIndex + 1]
                    this.setState({ rateIndex: rateIndex + 1 });
                  }
                }}
                style={{color: rateIndex < this.rateList.length - 1 ? '' : 'grey'}}
              />
            </div>

            <div className="right">
              {
                paused ? <Icon type="play-circle"
                  onClick={() => {
                    this.refs.audio && this.refs.audio.play();
                  }}
                /> :
                <Icon type="pause-circle"
                  onClick={() => {
                    this.refs.audio && this.refs.audio.pause();
                  }}
                />
              }
              <Icon
                type="close-circle"
                onClick={this.props.onClose}
              />
            </div>
          </div>
        </div>

        <div 
          className="lrc-box" 
          ref="lrcBox" 
          onTouchEnd={this.eventTouchendLrcBox}
          onTouchStart={this.eventTouchstartLrcBox}
        >
          <span className="divider"></span>
          {
            this.state.lrcs.map((lrc, index) => (
              <div
                className={`lrc-line ${currentIndex === index ? 'actived' : ''}`}
                key={index}
                data-key={index}
                style={{
                  marginTop: index === 0 ? `${lrcBoxHalfHeight}px` : '',
                  marginBottom: index === lrcMaxIndex ? `${lrcBoxHalfHeight}px` : '',
                }}
              >
                <span>{lrc.originalLyric}</span>
                {
                  lrc.translationalLyric ? <span>{lrc.translationalLyric}</span> : ''
                }
                {
                  // currentIndex === index ? <span className="divider"></span> : ''
                }
              </div>
              
            ))
          }
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

