/**
 * @description 寻找某个目录下的指定后缀名文件
 */
const path = require('path').posix;
const promisify = require('util').promisify;
const fs = require('fs');
const fsReadFile = promisify(fs.readFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const { cloneDeep } = require('lodash');
// const fsAccess = promisify(fs.access);
const fileReg = /\.(avi)/i;
const ROOT_DIR = path.resolve(__dirname, '../pd').replace(/\\/g, '/');
const TREE_NODE = {
  children: null,
  matchedFiles: null,
  dirPath: '',
  baseName: ''
};
const fileTreeRoot = cloneDeep(TREE_NODE);
const matchedFileList = [];

main();

async function main() {
  try {
    fs.accessSync(ROOT_DIR);
    await readFile(ROOT_DIR, fileTreeRoot);
    console.log(JSON.stringify(matchedFileList, null, 2));
    console.log(analyseResult());
  } catch (err) {
    console.log(err)
  }
}

// 读取文件夹
async function readFile(dir, tree) {
  const files = await fsReaddir(dir);
  tree.dirPath = dir;
  tree.baseName = path.basename(dir);

  for await(let item of files) {
    const fullPath = path.join(dir, item);
    const stat = await fsStat(fullPath);

    // 判断是否是文件夹
    if(stat.isDirectory()) {
      const child = cloneDeep(TREE_NODE);
      if(!tree.children) {
        tree.children = [];
      }
      tree.children.push(child);
      await readFile(fullPath, child);
    } else if(fileReg.test(item)) {
      if(!tree.matchedFiles) {
        tree.matchedFiles = [];
      }
      const temp = {
        dirName: path.dirname(fullPath),
        fullPath,
        fileName: item
      };
      tree.matchedFiles.push(temp);
      matchedFileList.push(temp);
    }
  }
}

// 返回结果分析
function analyseResult(res = matchedFileList) {
  const total = res ? res.length : 0;
  const diff = Array.from(new Set(res.map(item => item.dirName)));

  return {
    total,
    dirs: diff
  };
}
