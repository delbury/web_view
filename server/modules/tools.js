const expert = require('chai').expect;
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
  const pageNum = Number(ctx.query.pageNum || 1);
  const pageSize = Number(ctx.query.pageSize || 20);
  const len = arr.length;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    hasNext: end >= len ? false : true,
    total: Math.ceil(len / pageSize),
    data: arr.slice(start, end)
  };
}

function getTree(tree, ids = '1') {
  expert(tree).not.to.be.equal(undefined);
  const arr = ids.split(',');
  let id = '1';
  let subTree = tree;
  while(id = arr.shift()) {
    tree.children.forEach(item => {
      if(item.id == id) {
        subTree = item;
      }
    });
  }
  return {
    data: subTree
  }
}

module.exports = {
  shuffle,
  computedResource,
  getTree
}
