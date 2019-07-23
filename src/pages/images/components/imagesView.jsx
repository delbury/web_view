import React, { Component } from 'react';
import { Flex } from 'antd-mobile';
import './image.scss';

export default class ImagesView extends Component {
  constructor() {
    super();
  }
  render() {
    const IMGS = this.props.imgs;
    const index = this.props.index;
    return (
      <Flex className="imageview">
        <img
          src={IMGS[index].src}
          alt={IMGS[index].title}
          onClick={this.props.onClick}
        />
      </Flex>
    );
  }
}
