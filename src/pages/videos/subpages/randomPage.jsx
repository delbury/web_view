import React, { Component } from 'react';
import { Grid, WhiteSpace } from 'antd-mobile';
import Video from '../components/video'
import VideosView from '../components/videosView';
import { getRandomVideos } from '../../../api';
// import { consoleTest } from '../components/js/tool';


class RandomPageVideos extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
      index: 0,
      videos: [],
      loading: false
    };
    this.pageInfo = {
      pageSize: 10,
      pageNum: 1,
      hasNext: true,
      total: 0,
    }
  }
  handleVideosViewClick = (ev) => {
    this.setState({ showView: false });
  }
  handleVideoClick = (index) => {
    this.setState({
      showView: true,
      index
    });
  }
  handleChangeVideo = async ev => {
    const index = this.state.index;
    if(ev === 'prev') {
      // 上一页
      this.setState({
        index: index !== 0 ? index - 1 : 0
      })
    } else {
      // 下一页
      if(index === this.state.videos.length - 1) {
        if(!this.pageInfo.hasNext || this.state.loading) {
          return;
        } else {
          await this.fetchData();
          this.setState({ index: index + 1 });
        }
      } else {
        this.setState({ index: index + 1 });
      }
    }
  }
  handleRefresh = () => {
    if(this.pageInfo.hasNext) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    if(this.state.loading || !this.pageInfo.hasNext) return;
    this.setState({ loading: true });
    const res = (await getRandomVideos({
      pageSize: this.pageInfo.pageSize,
      pageNum: this.pageInfo.pageNum++
    })).data;
    this.setState((state) => ({
      videos: state.videos.concat(res.data)
    }));
    this.pageInfo.hasNext = res.hasNext;
    this.pageInfo.total = res.total;
    this.setState({ loading: false });
  }

  handleScroll = ev => {
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if((clientHeight + scrollTop) - scrollHeight > -20) {
      this.fetchData();
    }
  }

  componentDidMount() {
    this.fetchData();
    window.addEventListener('scroll', this.handleScroll);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  render() {
    const VIDEOS = this.state.videos;
    return (
      <div>
        <Grid
          className="videobox"
          data={VIDEOS}
          renderItem={(item, index) => 
            <Video
              video={item}
              onClick={() => this.handleVideoClick(index)}
            />
          }
          columnNum={2}
        >
        </Grid>
        {/* {
          this.state.showView ? (
            <VideosView
              imgs={IMGS}
              onClick={this.handleVideosViewClick}
              index={this.state.index}
              onChangeImage={this.handleChangeVideo}
            ></VideosView>
          ) : ''
        } */}
      <WhiteSpace size="lg" />
    </div>
    );
  }
}

export default RandomPageVideos;
