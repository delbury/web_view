import React from 'react';
import { Button } from 'antd';
import './style.scss';
import { getRandomVideos } from '../../api';

export default class RandomVideo extends React.Component {
  constructor(props) {
    super();
    this.state = {
      videoSrc: '',
      loading: false,
      videoList: [],
    };
  }

  // 切换视频
  handleSwitch = async () => {
    if(this.state.loading) return;

    if(this.state.videoList.length) {
      const videoList = [...this.state.videoList];
      const video = videoList.shift();
      this.setState({
        videoSrc: window.API_BASE_URL + video.sourcrPath + `/${video.sourceIndex}`,
        videoList: videoList,
      });

    } else {
      this.setState({ loading: true });
      const res = await getRandomVideos();

      const list = (res.data && res.data.data) || [];

      if(list.length) {
        const video = list.shift();

        this.setState({
          videoSrc: window.API_BASE_URL + video.sourcrPath + `/${video.sourceIndex}`,
          loading: false,
          videoList: list,
        });
      }
    }
  }

  componentDidMount() {
    this.refs.video.oncanplay = ev => {
      this.refs.video.play();
    };
  }

  render() {
    return (
      <div className="page-random">
        <div className="video-container">
          <video src={this.state.videoSrc} ref="video"></video>
        </div>
        <div className="video-btns">
          <Button onClick={() => this.state.videoSrc && this.refs.video.play()}>播放</Button>
          <Button onClick={() => this.state.videoSrc && this.refs.video.pause()}>暂停</Button>
          <Button type="primary" loading={this.state.loading} onClick={() => this.handleSwitch()}>切换</Button>
        </div>
      </div>
    );
  }
}