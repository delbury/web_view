import React, { Component } from 'react';
// import './navbar.scss';
// import { withRouter } from 'react-router-dom';
import { SegmentedControl, WhiteSpace, WingBlank } from 'antd-mobile';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: ['Home', 'Files', 'Random']
    };
  }
  handleSegChange = ev => {
    this.props.changePage(ev.nativeEvent.selectedSegmentIndex);
  }
  render() {
    return (
      <WingBlank className="header">
        <WhiteSpace size="lg" />
        <SegmentedControl
          values={this.state.pages}
          selectedIndex={this.props.currentPage}
          onChange={this.handleSegChange}
        />
        <WhiteSpace size="lg" />
      </WingBlank>
    );
  }
}

export default NavBar;
