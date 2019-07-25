import React, { Component } from 'react';
import { Flex } from 'antd-mobile';
import { Icon } from 'antd';
import './style/image.scss';
import Hammer from 'hammerjs';
// import Zmage from 'react-zmage';
import { preventPullToRefresh, consoleTest } from './js/tool';

export default class ImagesView extends Component {
  constructor() {
    super();
    this.hammer = null;
    this.windowWH = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.currentWH = {
      ...this.windowWH
    }
    this.state = {
      ...this.windowWH,
      isSpan: false,
      spanDir: 0, // 0, 90, -90
      frozen: false,
      draggable: false,
      scalable: false,
      spinable: true,
      switchable: true
    };
    this.iv = null;
  }
  spinImage = deg => {
    if(deg === 0) {
      this.setState({
        isSpan: false,
        spanDir: 0
      });
    } else {
      this.setState({
        isSpan: true,
        spanDir: deg
      });
    }
  }
  changeImage = type => {
    const ev = (type < 0) ? 'next' : 'prev';
    this.props.onChangeImage(ev);
  }
  
  componentWillMount() {
    // this.spinImage(90);
  }
  componentDidMount() {
    this.iv = this.refs.imageview;
    this.iv.onload = ev => {
      const { width, height } = this.iv;
      if(width > height) {
        this.spinImage(90);
      } else {
        this.spinImage(0);
      }
    };
    preventPullToRefresh(this.iv);
    this.hammer = new Hammer(this.iv);

    // 前一页后一页
    if(this.state.switchable) {
      this.hammer.on('panstart', ev => {
        const { deltaX: ox } = ev;
        const fnMove = ev => {
          const { deltaX } = ev;
          const dx = deltaX - ox;
          
          if(Math.abs(dx) > 50) {
            this.changeImage(dx);
            this.hammer.off('panmove', fnMove);
            this.hammer.off('panend', fnEnd);
          }
        }
        const fnEnd = ev => {
          this.hammer.off('panmove', fnMove);
          this.hammer.off('panend', fnEnd);
        }
        this.hammer.on('panmove', fnMove);
        this.hammer.on('panend', fnEnd);
      });
    }
    // 前一页后一页结束

    // 缩放
    if(this.state.scalable) {
      this.hammer.get('pinch').set({ enable: true });
      this.hammer.on('pinchmove', ev => {
        const curScale = this.state.width / this.windowWH.width;
        const scale = ev.scale;
        if((curScale > 1.5 && scale > 1) || (curScale < 0.8 && scale < 1)) {
          return;
        }
        this.setState({
          width: this.currentWH.width * scale,
          height: this.currentWH.height * scale
        });
      });
      this.hammer.on('pinchend', ev => {
        this.currentWH.width = this.state.width;
        this.currentWH.height = this.state.height;
      });
    }
    // 缩放结束

    // 拖动
    if(this.state.draggable) {
      this.hammer.on('panstart', ev => {
        if(this.state.frozen) return;
        const { marginLeft: ml, marginTop: mt } = this.iv.style;

        const fnMove = ev => {
          const { deltaX, deltaY } = ev;
          
          const { offsetLeft, clientWidth } = ev.target;
          if(offsetLeft < -20) {
            console.log('prev')
          } else if(offsetLeft + clientWidth - window.innerWidth > 20 ) {
            console.log('next')
          }
          
          this.iv.style.marginLeft = parseInt(ml || 0) + deltaX + 'px';
          this.iv.style.marginTop = parseInt(mt || 0) + deltaY + 'px';
        };
        const fnEnd = ev => {
          this.hammer.off('panmove', fnMove);
          this.hammer.off('panend', fnEnd);
        };

        this.hammer.on('panmove', fnMove);
        this.hammer.on('panend', fnEnd);
      })
    }
    // 拖动结束

    // 旋转
    if(this.state.spinable) {
      this.hammer.on('press', ev => {
        ev.preventDefault();
        this.setState({ frozen: true });
        const fnEnd = ev => {
          this.setState({ frozen: false });
          this.hammer.off('panmove', fnMove);
          this.hammer.off('panend', fnEnd);
          this.hammer.off('pressup', fnEnd);
        };
        const fnMove = ev => {
          const { deltaX: x, deltaY: y} = ev;
          if(y < x && y < -x) {
            this.spinImage(0);
          } else if(y < -x && y >= x) {
            this.spinImage(-90);
          } else if(y >= -x && y < x) {
            this.spinImage(90);
          }
        }
        this.hammer.on('panmove', fnMove);
        this.hammer.on('panend', fnEnd);
        this.hammer.on('pressup', fnEnd);
      });
    }
    // 旋转结束
  }
  componentWillUnmount() {
    this.hammer = null;
    this.currentWH = Object.assign({}, {...this.windowWH});
    this.setState({
      ...this.windowWH
    });
  }
  
  render() {
    const { imgs: IMGS, index } = this.props;
    const { width, height, isSpan, spanDir, frozen } = this.state;
    const style = {
      left: isSpan ? '50%' : '',
      top: isSpan ? '50%' : '',
      maxWidth: isSpan ? height : width,
      maxHeight: isSpan ? width : height,
      transform: isSpan ?　`translate(-50%, -50%) rotate(${spanDir}deg)` : `rotate(${spanDir}deg)`
    };
    return (
      <Flex className="imageview" onClick={this.props.onClick}>
        <Icon type="retweet" className={`icon ${frozen ? 'show' : ''}`} />
        <img
          style={style}
          className="img-normal"
          src={IMGS[index].src}
          alt={IMGS[index].alt}
          onClick={this.props.onClick}
          ref="imageview"
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
