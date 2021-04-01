import React, { Component } from 'react';
import './style/image.scss';

export default class PageImages extends Component {
  componentDidMount() {
    if(this.props.io && this.refs.imgbox) {
      this.props.io.observe(this.refs.imgbox);
    }
  }
  render() {
    const img = this.props.img;
    return (
      <div ref="imgbox" className="imgbox">
        <img
          data-src={window.API_BASE_URL + img.src}
          alt={img.alt}
          onClick={this.props.onClick}
          // style={{ visibility: 'hidden' }}
        />
      </div>
    );
  }
}
