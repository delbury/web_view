import React, { Component } from 'react';
import './styles/home.scss';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import NavBar from './components/navbar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 'home'
    };
  }
  changePage = (page) => {
    console.log(page)
    this.setState({ currentPage: page });
  }
  render() {
    const currentPage = this.state.currentPage;
    return (
      <div className="App">
        <HashRouter>
          <NavBar
            currentPage={currentPage}
            changePage={this.changePage}
          ></NavBar>
          <Switch>
            <Route exact path="/home"></Route>
            <Route exact path="/images"></Route>
            <Route exact path="/videos"></Route>
            <Redirect to="/home"></Redirect>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}

export default App;
