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

// const URL = 'http://192.168.191.1:4000';
const URL = 'http://192.168.0.104:4000';
export function consoleTest(value) {
  window.fetch(URL + '/test?value=' + value, {
    method: 'get',
  });
}
