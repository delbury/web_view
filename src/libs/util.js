export const enmuCreater = (arr) => {
  const obj = {};
  arr.forEach((item, index) => {
    if(!obj[item]) {
      obj[item] = index;
      obj[index] = item;
    }
  });
  return obj;
};

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
