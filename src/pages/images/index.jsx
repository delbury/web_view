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
      index: 0
    };
  }
  handleImagesViewClick = () => {
    this.setState({ showView: false });
  }
  handleImageClick = (index) => {
    console.log(index)
    this.setState({
      showView: true,
      index
    });
  }
  render() {
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
        ></ImagesView>
      )
    );
  }
}

export default PageImages;
