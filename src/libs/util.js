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

// 时间转换
export function timeToString(time) {
  const sym = time > 0 ? '+' : '-';
  time = Math.abs(Math.round(+time));
  const seconds = time % 60 || 0;
  const rest = (time - seconds) / 60;
  const minutes = rest % 60 || 0;
  const hours = (rest - minutes) / 60 || 0;
  const fn = num => num.toString().padStart(2, '0');
  return `${sym} ${fn(hours)}:${fn(minutes)}:${fn(seconds)}`;
}

// 创建交叉监听
export function createIO() {
  const io = new IntersectionObserver((records) => {
    // 图片懒加载
    for(const record of records) {
      const img = record.target.querySelector('img');
      if(record.isIntersecting && !img.src) {
        img.src = img.dataset.src;
        img.style.visibility = 'visible';
        io.unobserve(record.target);
      }
    }
  });
  return io;
}
