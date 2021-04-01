import React, { Component } from 'react';
import { Flex } from 'antd-mobile';
import { Icon } from 'antd';
import './style/image.scss';
import Hammer from 'hammerjs';
// import Zmage from 'react-zmage';
import { preventPullToRefresh } from '../../../libs/util';
import ReactDOM from 'react-dom';

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
      draggable: false, // 拖动
      scalable: false, // 缩放
      spinable: false, // 按压旋转
      switchable: true, // 前一页后一页
      rotatable: true, // 双指旋转
    };
    this.iv = null;
  }

  // 旋转照片
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

  // 改变照片
  changeImage = type => {
    const ev = (type < 0) ? 'next' : 'prev';
    this.props.onChangeImage(ev);
  }
  
  componentDidMount() {
    // document.body.style.overflow = 'hidden';

    this.iv = this.refs.imageview;
    ReactDOM.findDOMNode(this.refs.imageviewBox).ontouchmove = ev => {
      ev.preventDefault();
    };
    
    preventPullToRefresh(this.iv);
    this.hammer = new Hammer(this.iv);

    // 前一页后一页
    if(this.state.switchable) {
      this.hammer.on('panstart', ev => {
        if(this.state.frozen) return;
        const { spanDir } = this.state;
        const { deltaX: ox } = ev;

        const fnMove = ev => {
          const { deltaX } = ev;
          const dx = deltaX - ox;

          this.refs.imageview.style.transform = `translateX(${dx}px) rotate(${spanDir}deg)`;
        }

        const fnEnd = ev => {
          const { deltaX } = ev;
          const dx = deltaX - ox;
          if(Math.abs(dx) > 50) {
            this.changeImage(dx);
            this.hammer.off('panend', fnEnd);
          }
          
          this.hammer.off('panend', fnEnd);
          this.hammer.off('panmove', fnMove)

          this.refs.imageview.style.transform = `rotate(${spanDir}deg)`;
        }
        this.hammer.on('panend', fnEnd);
        this.hammer.on('panmove', fnMove)

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

    // 按压旋转
    if(this.state.spinable) {
      this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      this.hammer.on('press', ev => {
        ev.preventDefault();
        this.setState({ frozen: true });
        const fnEnd = ev => {
          this.setState({ frozen: false });
          this.hammer.off('panmove', fnMove);
          this.hammer.off('panend', fnEnd);
          this.hammer.off('pressup', fnEnd);
          this.hammer.off('pancancel', fnEnd);
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
        this.hammer.on('pancancel', fnEnd);
      });
    }
    // 旋转结束

    // 双指旋转开始
    if(this.state.rotatable) {
      this.hammer.get('rotate').set({ enable: true });
      this.hammer.on('rotatestart', ev => {
        const { spanDir } = this.state;
        const oDeg = ev.rotation;

        const fnMove = ev => {
          const dDeg = ev.rotation - oDeg;

          this.refs.imageview.style.transform = `rotate(${spanDir + dDeg}deg)`;
        };
        const fnEnd = ev => {
          const dDeg = ev.rotation - oDeg;
          this.hammer.off('rotatemove', fnMove);
          this.hammer.off('rotateend', fnEnd);

          let deg = spanDir;
          if(dDeg > 45 && spanDir < 90) {
            deg = spanDir + 90
          } else if(dDeg < -45 && spanDir > -90) {
            deg = spanDir - 90

          }
          this.spinImage(deg)
          this.refs.imageview.style.transform = `rotate(${deg}deg)`;
        };

        this.hammer.on('rotatemove', fnMove);
        this.hammer.on('rotateend', fnEnd)
      });
    }
    // 双指旋转结束
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
    const { isSpan, spanDir, frozen } = this.state;
    const style = {
      maxWidth: isSpan ? '100vh': '100vw',
      maxHeight: isSpan ? '100vw': '100vh',
      transform: `rotate(${spanDir}deg)`,
    };
    return (
      <Flex ref="imageviewBox" className="imageview" onClick={this.props.onClick}>
        <Icon type="retweet" className={`icon ${frozen ? 'show' : ''}`} />
        <img
          className="img-normal"
          style={style}
          src={window.API_BASE_URL + IMGS[index].src}
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
