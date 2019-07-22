import React, { Component } from 'react';
import './navbar.scss';
import { withRouter } from 'react-router-dom';
import { Flex, WhiteSpace, WingBlank, TabBar  } from 'antd-mobile';

class NavBar extends Component {
  render() {
    return (
      <Flex>
        <TabBar>
          <TabBar.Item>Home</TabBar.Item>
          <TabBar.Item>Images</TabBar.Item>
          <TabBar.Item>Videos</TabBar.Item>
        </TabBar>
      </Flex>
    )
  }
}

export default withRouter(NavBar);
