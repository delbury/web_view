import React, { Component } from 'react';
import { Flex } from 'antd-mobile';
import './image.scss';
import Zmage from 'react-zmage';

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
          className="img-span"
          src={IMGS[index].src}
          alt={IMGS[index].alt}
          onClick={this.props.onClick}
        />
        {/* <Zmage
          src={IMGS[index].src}
          set={IMGS}
          defaultPage={index}
          preset="mobile"
        /> */}
      </Flex>
    );
  }
}
