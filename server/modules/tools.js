const expert = require('chai').expect;
const cloneDeep = require('lodash').cloneDeep;
const fs = require('fs');
const promisify = require('util').promisify;
const fsAccess = promisify(fs.access);

// 随机排列
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

// 资源分页
function computedResource(ctx, arr) {
  const pageNum = Number(ctx.query.pageNum || 1);
  const pageSize = Number(ctx.query.pageSize || 20);
  const len = arr.length;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    hasNext: end >= len ? false : true,
    totalPages: Math.ceil(len / pageSize),
    totalItems: arr.length,
    data: arr.slice(start, end),
    pageNum,
    pageSize,
  };
}

// 返回随机资源
function eachRandomResource(ctx, arr) {
  const pageSize = Number(ctx.query.pageSize || 20);
  const len = arr.length;
  const temp = Array.from({ length: len }, (v, i) => i);
  const data = [];

  // 随机算法
  for (let i = len - 1; i >= Math.max(len - pageSize, 0); i--) {
    const index = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[index]] = [temp[index], temp[i]];
    data.push(arr[temp[i]]);
  }

  return {
    hasNext: len > pageSize,
    data
  }
}

// 随机分页
function computedRandomResource(sources, size = 10) {
  let hasNext = false;
  const data = [];

  if(sources.length) {
    hasNext = true;
    if(size < 5 * sources.length) {
      // 总资源少时，全部洗牌
      data.push(...sources);
    
      for (let i = sources.length - 1; i >= 0; i--) {
        const index = Math.floor(Math.random() * (i + 1));
        [data[i], data[index]] = [data[index], data[i]];
      }
    } else {
      // 总资源较多，抽牌
      const temp = new Set(); // 缓存已抽取的资源
      let count = 10;
      while(count) {
        const index = Math.floor(Math.random() * sources.length);
        if(!temp.has(index)) {
          temp.add(index);
          count--;
          data.push(sources[index]);
        }
      }
    }
  }

  return {
    hasNext,
    data: data.slice(0, size),
    size,
    totalItems: sources.length,
  };
}

// 文件数树
function getTree(tree, ids = '1') {
  expert(tree).not.to.be.equal(undefined);
  const arr = ids.split(',');
  let id = '1';
  let subTree = tree;
  while (id = arr.shift()) {
    tree.children.forEach(item => {
      if (item.id == id) {
        subTree = item;
      }
    });
  }
  return {
    data: subTree
  }
}

// 获取当前时间
function getCurrentDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = (date.getDate()).toString().padStart(2, '0');
  const hour = (date.getHours()).toString().padStart(2, '0');
  const minute = (date.getMinutes()).toString().padStart(2, '0');
  const second = (date.getSeconds()).toString().padStart(2, '0');
  const ms = date.getMilliseconds();

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
}

// 过滤文件夹列表
async function filterExistDirs(dirs, log = false) {
  const arr = [];
  for await(let dir of dirs) {
    try {
      await fsAccess(dir);
      arr.push(dir);
    } catch {
      log && console.log(`${dir} doesn't exist`);
    }
  }

  return arr;
}

module.exports = {
  shuffle,
  computedResource,
  getTree,
  eachRandomResource,
  getCurrentDateTime,
  filterExistDirs,
  computedRandomResource,
}
