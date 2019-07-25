export function preventPullToRefresh(element) {
  let prevent = false;

    element.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1) { return; }

      let scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
      prevent = (scrollY === 0);
    });

    element.addEventListener('touchmove', function(e){
      if (prevent) {
        prevent = false;
        e.preventDefault();
      }
    });
};

export function consoleTest(value) {
  const fd = new FormData();
  fd.append('value', value);
  window.fetch('http://192.168.191.1:4000/test?value=' + value, {
    method: 'post',
    body: fd
  });
}
