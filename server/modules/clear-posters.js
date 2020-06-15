/**
 * @description 删除所有poster
 */
const { SOURCE_DIRS } = require('../config');
const path = require('path').posix;
const promisify = require('util').promisify;
const fs = require('fs');
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsUnlink = promisify(fs.unlink);

const fileReg = /\.(poster)/i;

main();

function main() {
  for(let dir of SOURCE_DIRS) {
    try {
      fs.accessSync(dir);
      clearFile(dir);
    } catch (err) {
      console.log(err)
    }
  }
}

// 读取文件夹
async function clearFile(dir) {
  const files = await fsReaddir(dir);

  for await(let item of files) {
    const fullPath = path.join(dir, item);
    const stat = await fsStat(fullPath);

    // 判断是否是文件夹
    if(stat.isDirectory()) {
      await clearFile(fullPath);
    } else if(fileReg.test(item)) {
      fsUnlink(fullPath);
    }
  }
}
