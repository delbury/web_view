/**
 * @description 删除所有poster
 * @argv
 *  -f 强制全部清除
 *  --log 打印 log
 */
const { SOURCE_DIRS } = require('../config');
const path = require('path').posix;
const promisify = require('util').promisify;
const fs = require('fs');
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsUnlink = promisify(fs.unlink);
const crypto = require('crypto');

const posterFileReg = /\.poster$/i;
const videoFileReg = /(\.mp4)$/i;
const videoExt = '.mp4';
const posterExt = '.poster';
const ignoreReg = /^ignore__.*/; // 过滤的文件名前缀

main();

function main() {
  const log = process.argv.includes('--log');
  const force = process.argv.includes('-f');
  for(let dir of SOURCE_DIRS) {
    try {
      fs.accessSync(dir);
      clearFile(dir, force);
    } catch (err) {
      log && console.log(err);
    }
  }
}

// 读取文件夹
async function clearFile(dir, force = false) {
  if(ignoreReg.test(path.basename(dir))) return; // 跳过忽略的文件夹

  console.log('start cleaning dir: ', dir);
  const files = await fsReaddir(dir);

  if(!force) {
    files.sort((a, b) => {
      const aExeced = videoFileReg.exec(a);
      const bExeced = videoFileReg.exec(b);
      const aExt = aExeced ? aExeced[0] : '';
      const bExt = bExeced ? bExeced[0] : '';
      
      if(aExt === videoExt && bExt !== videoExt) return -1;
      else if(aExt !== videoExt && bExt === videoExt) return 1;
      else return 0;
    }); // 排序，mp4 文件排在前面，先处理
  }

  const existSet = new Set(); // 记录存在的视频poster文件名

  for await(let item of files) {
    const fullPath = path.join(dir, item);
    const stat = await fsStat(fullPath);

    if(stat.isDirectory()) {
      // 判断是否是文件夹
      await clearFile(fullPath, force);
    } else if(posterFileReg.test(item)) {
      // 是否是poster
      if(force || !existSet.has(item)) {
        fsUnlink(fullPath);
        console.log('delete file: ', fullPath);
      }
    } else if(!force && videoFileReg.test(item)) {
      // 是否是video文件
      const md5 = crypto.createHash('md5');
      md5.update(item);
      const posterName = md5.digest('hex') + posterExt; // poster 名，不包括扩展名
      existSet.add(posterName);
    }
  }
}
