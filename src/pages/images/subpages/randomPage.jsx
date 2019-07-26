import React, { Component } from 'react';
import { Grid } from 'antd-mobile';
import Image from '../components/image'
import ImagesView from '../components/imagesView';
import { getRandomImages } from '../../../api';

// const imgs = [
//   {
//     src: './test-sources/1.jpg',
//     alt: "1"
//   },
//   {
//     src: './test-sources/2.jpg',
//     alt: "2"
//   },
//   {
//     src: './test-sources/3.jpg',
//     alt: "3"
//   },
//   {
//     src: './test-sources/4.jpg',
//     alt: "4"
//   }
// ];
// const IMGS = Array(40).fill(imgs).flat();
class RandomPageImages extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
      index: 0,
      images: []
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

  async componentWillMount() {
    const res = await getRandomImages();
    this.setState({ images: res.data.data });
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
    </div>
    );
  }
}

export default RandomPageImages;
