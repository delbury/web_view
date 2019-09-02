import React, { Component } from 'react';
import { Flex, Tabs } from 'antd-mobile';
import RandomPage from './subpages/randomPage';
import ClassifyPage from './subpages/classifyPage';
import FolderPage from './subpages/folderPage';
import { bindSwipeEvent } from '../../libs/swipeable';
import { setImagesHammer, clearImagesHammer } from '../../store/action';
import { connect } from 'react-redux';
import { consoleTest } from '../../api';

class PageImageIndex extends Component {
  constructor() {
    super();
    this.state = {
      tabs: [
        { title: 'Random' },
        { title: 'Classify' },
        { title: 'Folder' }
      ],
      currentTabIndex: 0,
      hammer: null
    };
    // this.state.hammer = null;
    this.scrollTops = {
      '0': 0,
      '1': 0,
      '2': 0
    };
  }

  handleChangePage = ev => {
    this.saveScrollTop(1);
    this.setState({ currentTabIndex: ev }, () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; 
    });
  }

  componentDidMount() {
    const element = document.querySelector('#images-content');
    const hammer = bindSwipeEvent(element, ev => {
      // ev.offsetDirection: rtl: 2, ltr: 4
      const dir = ev.offsetDirection;
      const cti = this.state.currentTabIndex;
      
      if(dir === 4) {
        if(cti > 0) {
          this.saveScrollTop(cti);
          this.setState({ currentTabIndex: cti - 1 }, () => {
            this.restoreScrollTop(cti - 1)    
          });
        }
      } else if(dir === 2) {
        if(cti < this.state.tabs.length - 1) {
          this.saveScrollTop(cti);
          this.setState({ currentTabIndex: cti + 1 }, () => {
            this.restoreScrollTop(cti + 1)    
          });
        }
      }
    });
    this.setState({ hammer });
    // this.props.setImagesHammer({ data: hammer });
  }
  componentWillUnmount() {
    // this.props.clearImagesHammer();
    if(this.state.hammer) {
      this.state.hammer.unbind();
      // this.setState({ hammer: null });
    }
  }

  handleTabChange = (tab, index) => {
    this.setState({ currentTabIndex: index });
    this.restoreScrollTop(index);
  }

  saveScrollTop = (index) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    this.scrollTops[index] = scrollTop;
  }

  restoreScrollTop = (index) => {
    const ctiTop = this.scrollTops[index];
    document.documentElement.scrollTop = ctiTop;
    document.body.scrollTop = ctiTop;    
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
          onTabClick={this.handleTabChange}
        >
          <RandomPage hammer={this.state.hammer} currentTabIndex={this.state.currentTabIndex}></RandomPage>
          <ClassifyPage onChangePage={this.handleChangePage}></ClassifyPage>
          <FolderPage hammer={this.state.hammer}></FolderPage>
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
