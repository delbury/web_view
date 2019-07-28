import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, WhiteSpace } from 'antd-mobile';
import Image from '../components/image'
import ImagesView from '../components/imagesView';

class FolderPageImages extends Component {
  constructor() {
    super();
    this.state = {
      showView: false,
      index: 0
    };
    this.len = 0;
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
    const index = this.state.index;
    if(ev === 'prev') {
      this.setState({
        index: index > 0 ? index - 1 : this.len - 1
      });
    } else {
      this.setState({
        index: index < this.len - 1 ? index + 1 : 0
      });
    }
  }
  render() {
    const IMGS = this.props.folder.files ? 
      this.props.folder.files.filter(item => item.type === 'image')
      : [];
    this.len = IMGS.length;
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

export default connect(
  state => ({
    folder: state.imagesFolder
  })
)(FolderPageImages);
