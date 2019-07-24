import React, { Component } from 'react';
import './image.scss';

export default class PageImages extends Component {
  render() {
    const img = this.props.img;
    return (
      <div className="imgbox">
        <img
          src={img.src}
          alt={img.alt}
          onClick={this.props.onClick}
        />
      </div>
    );
  }
}
