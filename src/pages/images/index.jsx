import React, { Component } from 'react';
import { Flex, Tabs } from 'antd-mobile';
import RandomPage from './subpages/randomPage';

class PageImageIndex extends Component {
  constructor() {
    super();
    this.state = {
      tabs: [
        { title: 'Random' },
        { title: 'Classify' },
        { title: 'Collection' }
      ]
    };
  }
  render() {
    return (
      <Flex>
        <Tabs
          tabs={this.state.tabs}
          tabBarBackgroundColor="rgba(0, 0, 0, 0)"
          tabBarTextStyle={{ fontSize: '0.8em' }}
          animated={false}
          swipeable={false}
        >
          <RandomPage></RandomPage>
          <div>1</div>
          <div>2</div>
        </Tabs>
      </Flex>
    );
  }
}

export default PageImageIndex;
