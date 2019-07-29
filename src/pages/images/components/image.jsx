import React, { Component } from 'react';
import './style/image.scss';

export default class PageImages extends Component {
  render() {
    const img = this.props.img;
    return (
      <div className="imgbox">
        <img
          src={window.API_BASE_URL + img.src}
          alt={img.alt}
          onClick={this.props.onClick}
        />
      </div>
    );
  }
}
