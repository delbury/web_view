import React from 'react';
import { Button } from 'antd';
import './style.scss';
import { getRandomVideos } from '../../api';
import Video from '../files/components/video';

export default class RandomVideo extends React.Component {
  constructor(props) {
    super();
    this.state = {
      loading: false,
      videoList: [],
      video: null,
    };
  }

  // 切换视频
  handleSwitch = async (cb) => {
    if(this.state.loading) return;

    if(this.state.videoList.length) {
      const videoList = [...this.state.videoList];
      const video = videoList.shift();
      this.setState({
        videoList: videoList,
        video,
      }, () => cb && cb());

    } else {
      this.setState({ loading: true });
      const res = await getRandomVideos();

      const list = (res.data && res.data.data) || [];

      if(list.length) {
        const video = list.shift();

        this.setState({
          loading: false,
          videoList: list,
          video,
        }, () => cb && cb());
      }
    }
  }

  // 返回
  goBack() {
    this.props.history.goBack();
  }

  // 关闭
  handleCloseMedia = () => {
    this.setState({
      video: null,
    });
  }

  // 前进
  handleForwardMedia = (cb) => {
    this.handleSwitch(cb);
  }

  // 结束回调
  handleVideoEnded = () => {
    this.handleSwitch();
  }

  render() {
    return (
      <div className="page-random">
        <div className="video-container">
          {
            this.state.video ? 
              <Video
                onForward={this.handleForwardMedia}
                onClose={this.handleCloseMedia}
                onEnded={this.handleVideoEnded}
                video={this.state.video}
                isFirst={true}
                isLast={false}
              >
              </Video> : null
          }
        </div>
        <div className="video-btns">
          <Button ghost shape="circle" icon="arrow-left" onClick={() => this.goBack()}></Button>

          <Button.Group>
            {/* <Button icon="caret-right" onClick={() => this.state.videoSrc && this.refs.video.play()}>播放</Button> */}
            {/* <Button icon="pause" onClick={() => this.state.videoSrc && this.refs.video.pause()}>暂停</Button> */}
            <Button icon="step-forward" type="primary" loading={this.state.loading} onClick={() => this.handleSwitch()}>开始</Button>
          </Button.Group>
        </div>
      </div>
    );
  }
}