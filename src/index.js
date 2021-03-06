import './libs/init'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'antd/dist/antd.css';
import 'antd-mobile/dist/antd-mobile.css';
import './assets/icon/iconfont.css';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
