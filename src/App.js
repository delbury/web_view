import React, { Component } from 'react';
import './styles/home.scss';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import NavBar from './components/navbar';
import PageHome from './pages/home';
import PageImages from './pages/images';
import PageVideos from './pages/videos';
import { enmuCreater } from './libs/util';
import { WingBlank } from 'antd-mobile';

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
        <NavBar
          currentPage={currentPage}
          changePage={this.changePage}
        ></NavBar>
        <WingBlank>
          <Switch>
            <Route exact path={PAGE_ROUTERS[0]} component={PageHome}></Route>
            <Route exact path={PAGE_ROUTERS[1]} component={PageImages}></Route>
            <Route exact path={PAGE_ROUTERS[2]} component={PageVideos}></Route>
            <Redirect to="/home"></Redirect>
          </Switch>
        </WingBlank>
      </div>
    );
  }
}

export default withRouter(App);
