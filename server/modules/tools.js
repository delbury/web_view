const cloneDeep = require('lodash').cloneDeep;

function shuffle(array) {
  array = cloneDeep(array);
  let m = array.length, t, i;
  // 如果还剩有元素…
  while (m) {
    // 随机选取一个元素…
    i = Math.floor(Math.random() * m--);
    // 与当前元素进行交换
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

module.exports = {
  shuffle
}
