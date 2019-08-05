import React, { Component } from 'react';
import { Grid, WhiteSpace } from 'antd-mobile';
import Image from '../components/image'
import ImagesView from '../components/imagesView';
import { getRandomImages } from '../../../api';
// import { consoleTest } from '../components/js/tool';


class RandomPageImages extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
      index: 0,
      images: [],
      loading: false
    };
    this.pageInfo = {
      pageSize: 10,
      pageNum: 1,
      hasNext: true,
      total: 0,
    }
  }
  handleImagesViewClick = (ev) => {
    this.setState({ showView: false });
    this.props.hammer.enable();
  }
  handleImageClick = (index) => {
    this.setState({
      showView: true,
      index
    });
    this.props.hammer.disable();
  }
  handleChangeImage = async ev => {
    const index = this.state.index;
    if(ev === 'prev') {
      // 上一页
      this.setState({
        index: index !== 0 ? index - 1 : 0
      })
    } else {
      // 下一页
      if(index === this.state.images.length - 1) {
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
    const res = (await getRandomImages({
      pageSize: this.pageInfo.pageSize,
      pageNum: this.pageInfo.pageNum++
    })).data;
    this.setState((state) => ({
      images: state.images.concat(res.data)
    }));
    this.pageInfo.hasNext = res.hasNext;
    this.pageInfo.total = res.total;
    this.setState({ loading: false });
  }

  handleScroll = ev => {
    if(this.props.currentTabIndex !== 0) return;
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
    const IMGS = this.state.images;
    return (
      <div>
        <Grid
          className="imagebox"
          data={IMGS}
          renderItem={(item, index) => 
            <Image
              img={item}
              onClick={() => this.handleImageClick(index)}
            />
          }
          columnNum={2}
        >
        </Grid>
        {
          this.state.showView ? (
            <ImagesView
              imgs={IMGS}
              onClick={this.handleImagesViewClick}
              index={this.state.index}
              onChangeImage={this.handleChangeImage}
            ></ImagesView>
          ) : ''
        }
      <WhiteSpace size="lg" />
    </div>
    );
  }
}

export default RandomPageImages;
