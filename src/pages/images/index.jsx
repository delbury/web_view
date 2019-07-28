import React, { Component } from 'react';
import { Flex, Tabs } from 'antd-mobile';
import RandomPage from './subpages/randomPage';
import ClassifyPage from './subpages/classifyPage';
import FolderPage from './subpages/folderPage';

class PageImageIndex extends Component {
  constructor() {
    super();
    this.state = {
      tabs: [
        { title: 'Random' },
        { title: 'Classify' },
        { title: 'Folder' }
      ],
      currentTabIndex: 0
    };
  }

  handleChangePage = ev => {
    this.setState({ currentTabIndex: ev });
  }

  render() {
    return (
      <Flex>
        <Tabs
          tabs={this.state.tabs}
          tabBarBackgroundColor="rgba(0, 0, 0, 0)"
          tabBarTextStyle={{ fontSize: '0.8em' }}
          animated={false}
          swipeable={true}
          page={this.state.currentTabIndex}
          onChange={(tab, index) => this.setState({ currentTabIndex: index })}
        >
          <RandomPage></RandomPage>
          <ClassifyPage onChangePage={this.handleChangePage}></ClassifyPage>
          <FolderPage></FolderPage>
        </Tabs>
      </Flex>
    );
  }
}

export default PageImageIndex;
