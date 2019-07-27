import React, { Component } from 'react';
import './styles/index.scss';
import { Route, Redirect, withRouter } from 'react-router-dom';
import NavBar from './components/navbar';
import PageHome from './pages/home';
import PageImages from './pages/images';
import PageVideos from './pages/videos';
import { enmuCreater } from './libs/util';
import { WingBlank } from 'antd-mobile';
import { BackTop } from 'antd';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { connect } from "react-redux";

const PAGE_ROUTERS = enmuCreater([
  '/home',
  '/images',
  '/videos'
]);
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0
    };
  }
  componentWillMount() {
    this.setState({
      currentPage: PAGE_ROUTERS[this.props.location.pathname]
    });
  }
  changePage = (pageIndex) => {
    this.setState({ currentPage: pageIndex });
    this.props.history.push(PAGE_ROUTERS[pageIndex]);
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
        <WingBlank>
          <CacheSwitch>
            <Route exact path={PAGE_ROUTERS[0]} component={PageHome}></Route>
            <CacheRoute exact path={PAGE_ROUTERS[1]} component={PageImages}></CacheRoute>
            <CacheRoute exact path={PAGE_ROUTERS[2]} component={PageVideos}></CacheRoute>
            <Redirect to="/home"></Redirect>
          </CacheSwitch>
        </WingBlank>
      </div>
    );
  }
}

const mapDispatchToProps = {};
// export default connect(
//   null,
//   mapDispatchToProps
// )(withRouter(App));
export default withRouter(App);
