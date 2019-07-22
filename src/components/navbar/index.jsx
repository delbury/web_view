import React, { Component } from 'react';
import './navbar.scss';
import { Radio, Icon } from 'antd';
import { withRouter } from 'react-router-dom';

class NavBar extends Component {
  handleChange = (ev) => {
    const data = ev.target.value;
    this.props.changePage(data);
    this.props.history.push('/' + data);
  }
  render() {
    const { Group: RadioGroup, Button: RadioButton } = Radio;
    console.log(this.props)
    return (
      <header>
        <h1>Local Website</h1>
        <RadioGroup 
          onChange={this.handleChange}
          value={this.props.currentPage}
          size="large"
          buttonStyle="solid"
        >
          <RadioButton value="home"><Icon type="home"/> Home</RadioButton>
          <RadioButton value="images"><Icon type="picture"/> Images</RadioButton>
          <RadioButton value="videos"><Icon type="play-square"/> Videos</RadioButton>
        </RadioGroup>
      </header>
    )
  }
}

export default withRouter(NavBar);
