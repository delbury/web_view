import React, { Component } from 'react';
import { Flex } from 'antd-mobile';
import './home.scss';

class PageHome extends Component {
  constructor() {
    super();
    this.state = {
      canvas: null,
      ctx: null,
      worker: null
    }
  }
  componentWillUnmount() {
    this.state.worker.postMessage({ type: 3 });
    this.state.worker.terminate();
    this.setState({
      canvas: null,
      ctx: null,
      worker: null
    });
  }
  componentDidMount() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const worker = new Worker('./js/worker/random-trip.js');
    this.setState({
      canvas,
      ctx,
      worker
    });
    worker.onmessage = ev => {
      const data = ev.data;
      ctx.drawImage(data, 0, 0);
    }
    worker.postMessage({
      type: 0,
      data: { width: canvas.width, height: canvas.height }
    });

    // canvas.onmousemove = ev => {
    //   const { offsetX, offsetY } = ev;
    //   worker.postMessage({
    //     type: 1,
    //     data: { offsetX, offsetY }
    //   });
    // }
    // canvas.onmouseleave = ev => {
    //   worker.postMessage({
    //     type: 2,
    //   });
    // }
  }
  render() {
    return (
      <Flex className="container">
        <canvas ref="canvas"></canvas>
      </Flex>
    );
  }
}

export default PageHome;
