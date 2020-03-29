import React, { Component } from 'react';
import { Icon } from 'antd';
import './network.scss';

class Network extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 0,
      show: true
    };
  }

  getSpeed() {
    if(!navigator.connection) {
      this.setState({ show: false })
      return
    }
    setTimeout(() => {
      this.setState({ speed: navigator.connection.downlink });
      return this.getSpeed()
    }, 500)
  }

  componentDidMount() {
    this.getSpeed()
  }

  render() {
    const speed = (+this.state.speed / 8).toFixed(2) + 'MB/s';
    return (
      <div className="network-info" style={{ display: this.state.show ? '' : 'none' }}>
        <Icon type="wifi" />
        <span className="text">{speed}</span>
      </div>
    );
  }
}

export default Network;
