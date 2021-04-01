import React, { Component } from 'react';
import './styles/index.scss';
import { Route, Redirect, withRouter } from 'react-router-dom';
import NavBar from './components/navbar';
import PageHome from './pages/home';
import PageFiles from './pages/files';
// import PageVideos from './pages/videos';
import { enmuCreater } from './libs/util';
import { WingBlank } from 'antd-mobile';
import { BackTop } from 'antd';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { connect } from 'react-redux';
import { getTreeActionAsync } from './store/action';
import { consoleTest } from './api';
import PageRandomVideo from './pages/random-video';

const PAGE_ROUTERS = enmuCreater([
  '/home',
  '/files',
  '/randomVideo',
  // '/videos'
]);
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0
    };
  }
  componentWillMount() {
    this.props.getTree();
    this.setState({
      currentPage: PAGE_ROUTERS[this.props.location.pathname]
    });

    window.addEventListener('hashchange', ev => {
      const hash = window.location.hash.replace('#', '')
      this.setState({ currentPage: PAGE_ROUTERS[hash] });
    });
  }
  changePage = (pageIndex) => {
    this.setState({ currentPage: pageIndex });
    this.props.history.push(PAGE_ROUTERS[pageIndex]);
  }
  componentDidMount() {
    // consoleTest(window.innerHeight);
  }
  render() {
    const currentPage = this.state.currentPage;
    return (
      <div className="App">
        <BackTop/>
        <NavBar
          currentPage={currentPage}
          changePage={this.changePage}
        ></NavBar>
        <WingBlank style={{ flex: 1 }}>
          <CacheSwitch>
            <Route exact path={PAGE_ROUTERS[0]} component={PageHome}></Route>
            <CacheRoute exact path={PAGE_ROUTERS[1]} component={PageFiles}></CacheRoute>
            <CacheRoute className="video-page" exact path={PAGE_ROUTERS[2]} component={PageRandomVideo}></CacheRoute>
            {/* <CacheRoute exact path={PAGE_ROUTERS[2]} component={PageVideos}></CacheRoute> */}
            <Redirect to="/home"></Redirect>
          </CacheSwitch>
        </WingBlank>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  tree: state.tree
});
const mapDispatchToProps = { getTree: getTreeActionAsync };
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(App));
// export default withRouter(App);
