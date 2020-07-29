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
    };
    this.lp = new LrcParser();
  }

  componentDidMount() {
    this.lrcBoxHalfHeight = this.refs.lrcBox.getBoundingClientRect().height / 2;
    
    this.refs.audio.ontimeupdate = ev => {
      const res = this.lp.lyricGenerator(ev.target.currentTime);
      if(res.changed) {
        const ele = document.querySelector(`.lrc-line[data-key="${res.index}"]`);
        if(!ele) {
          return;
        }
        const offsetTop = ele.offsetTop;
        if(offsetTop > this.lrcBoxHalfHeight) {
          this.refs.lrcBox.scrollTo({
            top: offsetTop - this.lrcBoxHalfHeight,
            behavior: 'smooth'
          });
          this.setState({
            currentIndex: res.index
          });
        }
      }
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

  render() {
    const audio = this.props.audio;
    const currentIndex = this.state.currentIndex;
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

        <div className="lrc-box" ref="lrcBox">
          {
            this.state.lrcs.map((lrc, index) => (
              <span className="lrc-line" key={index} data-key={index}>
                <span>{lrc.originalLyric}</span>
                {
                  lrc.translationalLyric ? <span>{lrc.translationalLyric}</span> : ''
                }
                {
                  currentIndex === index ? <span className="divider"></span> : ''
                }
              </span>
              
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

