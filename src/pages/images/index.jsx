import React, { Component } from 'react';
import { Grid } from 'antd-mobile';
import Image from './components/image'
import ImagesView from './components/imagesView';

const IMGS = [
  {
    src: './test-sources/1.jpg',
    alt: "1"
  },
  {
    src: './test-sources/2.jpg',
    alt: "2"
  },
  {
    src: './test-sources/3.jpg',
    alt: "3"
  },
  {
    src: './test-sources/4.jpg',
    alt: "4"
  }
];
class PageImages extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
      index: 0,
      images: IMGS
    };
  }
  handleImagesViewClick = (ev) => {
    this.setState({ showView: false });
  }
  handleImageClick = (index) => {
    this.setState({
      showView: true,
      index
    });
  }
  handleChangeImage = ev => {
    let index = this.state.index;
    if(ev === 'prev') {
      // 上一页
      this.setState({
        index: index === 0 ? this.state.images.length - 1 : index - 1
      })
    } else {
      // 下一页
      this.setState({
        index: index === this.state.images.length - 1 ? 0 : index + 1
      })
    }
  }

  render() {
    const IMGS = this.state.images;
    return (
      !this.state.showView ? (
        <Grid
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
      ) : (
        <ImagesView
          imgs={IMGS}
          onClick={this.handleImagesViewClick}
          index={this.state.index}
          onChangeImage={this.handleChangeImage}
        ></ImagesView>
      )
    );
  }
}

export default PageImages;
