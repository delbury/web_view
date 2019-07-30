import React, { Component } from 'react';
import { Flex, Tabs } from 'antd-mobile';
import RandomPage from './subpages/randomPage';
import ClassifyPage from './subpages/classifyPage';
import FolderPage from './subpages/folderPage';
import { bindSwipeEvent } from '../../libs/swipeable';
import { setImagesHammer, clearImagesHammer } from '../../store/action';
import { connect } from 'react-redux';

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
    this.hammer = null;
  }

  handleChangePage = ev => {
    this.setState({ currentTabIndex: ev });
  }

  componentDidMount() {
    const element = document.querySelector('#images-content');
    this.hammer = bindSwipeEvent(element, ev => {
      // ev.offsetDirection: rtl: 2, ltr: 4
      const dir = ev.offsetDirection;
      const cti = this.state.currentTabIndex;
      if(dir === 4) {
        if(cti > 0) {
          this.setState({ currentTabIndex: cti - 1 });
        }
      } else if(dir === 2) {
        if(cti < this.state.tabs.length - 1) {
          this.setState({ currentTabIndex: cti + 1 });
        }
      }
    });
    // this.props.setImagesHammer({ data: hammer });
  }
  componentWillUnmount() {
    // this.props.clearImagesHammer();
    if(this.hammer) {
      this.hammer.unbind();
      this.hammer = null;
    }
  }

  render() {
    return (
      <Flex id="images-content">
        <Tabs
          tabs={this.state.tabs}
          tabBarBackgroundColor="rgba(0, 0, 0, 0)"
          tabBarTextStyle={{ fontSize: '0.8em' }}
          animated={false}
          swipeable={false}
          page={this.state.currentTabIndex}
          onChange={(tab, index) => this.setState({ currentTabIndex: index })}
        >
          <RandomPage hammer={this.hammer}></RandomPage>
          <ClassifyPage onChangePage={this.handleChangePage}></ClassifyPage>
          <FolderPage hammer={this.hammer}></FolderPage>
        </Tabs>
      </Flex>
    );
  }
}

export default connect(
  null,
  {
    setImagesHammer,
    clearImagesHammer
  }
)(PageImageIndex);
