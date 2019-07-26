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

function computedResource(ctx, arr) {
  const pageNum = ctx.query.pageNum || 1;
  const pageSize = ctx.query.pageSize || 20;
  const len = arr.length;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    hasNext: end >= len ? false : true,
    total: Math.ceil(len / pageSize),
    data: arr.slice(start, end)
  };
}

module.exports = {
  shuffle,
  computedResource
}
