if(process.env.REACT_APP_API_BASE_URL) {
  window.API_BASE_URL = process.env.REACT_APP_API_BASE_URL
} else {
  window.API_BASE_URL = location.protocol + '//' + location.hostname + ':' + process.env.REACT_APP_API_BASE_PORT
}

window.print = (msg) => {
  if(typeof msg === 'object') {
    msg = JSON.stringify(msg, null, 2);
  }
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


if ("wView" in window) {
  window.wView.allowsInlineMediaPlayback = "YES";
  window.wView.mediaPlaybackRequiresUserAction = "NO";
}