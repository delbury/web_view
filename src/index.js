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

window.API_BASE_URL = process.env.REACT_APP_API_BASE_URL
window.print = (msg) => {
  return window.fetch(window.API_BASE_URL + '/console', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: `msg=${encodeURIComponent(msg)}`
  });
};

window.addEventListener('error', ev => {
  window.print(ev.message);
});

window.print(("wkWebView " in window).toString())

if ("wView" in window) {
  window.wView.allowsInlineMediaPlayback = "YES";
  window.wView.mediaPlaybackRequiresUserAction = "NO";
}

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
