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
      index: 0,
      currentLen: 0
    };
    this.len = 0;
    this.IMGS = [];
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
  handleChangeImage = ev => {
    const index = this.state.index;
    if(ev === 'prev') {
      this.setState({
        index: index > 0 ? index - 1 : this.len - 1
      });
    } else {
      if(index >= this.state.currentLen - 1) {
        if(this.state.currentLen < this.len) {
          this.setState(state => ({ currentLen: state.currentLen + 20 }));
        }
      }
      this.setState({
        index: index < this.len - 1 ? index + 1 : 0
      });
    }
  }

  handleScroll = ev => {
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if((clientHeight + scrollTop) - scrollHeight > -20) {
      if(this.state.currentLen < this.len) {
        this.setState(state => ({ currentLen: state.currentLen + 20 }));
      }
    }
  }

  componentDidUpdate(props, state) {
    if(props.folder !== this.props.folder) {
      this.IMGS = this.props.folder.files ? 
      this.props.folder.files.filter(item => item.type === 'image')
      : [];
      this.len = this.IMGS.length;
      this.setState({ currentLen: 20 });
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  render() {
    const IMGS = this.IMGS.slice(0, this.state.currentLen);
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
