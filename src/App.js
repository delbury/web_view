import React, { Component } from 'react';
import './styles/home.scss';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import NavBar from './components/navbar';
import PageHome from './pages/home';
import PageImages from './pages/images';
import PageVideos from './pages/videos';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: '/home'
    };
  }
  componentWillMount() {
    this.setState({
      currentPage: this.props.location.pathname
    });
  }
  changePage = (page) => {
    this.setState({ currentPage: page });
  }
  render() {
    const currentPage = this.state.currentPage;
    return (
      <div className="App">
        <NavBar
          currentPage={currentPage}
          changePage={this.changePage}
        ></NavBar>
        <Switch>
          <Route exact path="/home" component={PageHome}></Route>
          <Route exact path="/images" component={PageImages}></Route>
          <Route exact path="/videos" component={PageVideos}></Route>
          <Redirect to="/home"></Redirect>
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
