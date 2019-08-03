const path = require('path').posix;
const fs = require('fs');
const readline = require('readline');
const expect = require('chai').expect;

const promisify= require('util').promisify;
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsWriteFile = promisify(fs.writeFile);
const fsAccess = promisify(fs.access);
const fsReadFile = promisify(fs.readFile);
let resourceBaseUrl = '';
let rootPath = '';
let id = 1;

const sources = {
  dirsTree: {
    dirname: '',
    children: [],
    files: [],
    id: ''
  },
  imageList: [],
  videoList: []
};

const imageReg = /\.(jpg)|(jpeg)|(png)|(gif)/i;
const videoReg = /\.(mp4)|(ogg)|(webm)/i;
const FILES_INFO_NAME = 'files_info.json';

async function getFiles(baseUrl, tree = sources.dirsTree) {
  const rootDirName = path.basename(baseUrl);
  tree.dirname = rootDirName; // 记录文件夹名称
  tree.id = id++;

  // 获取文件夹下所有文件
  const files = await fsReaddir(baseUrl);
  expect(files).not.to.be.equal(null);
  for await(let item of files) {
    const fullName = path.join(baseUrl, item);
    const stats = await fsStat(fullName);
    expect(stats).not.to.be.equal(null);

    if(stats.isDirectory()) {
      // 是文件夹
      const child = {
        dirname: '',
        children: [],
        files: []
      };
      tree.children.push(child);
      await getFiles(fullName, child);
    } else {
      // 否则为文件
      const ext = path.extname(item);
      let type = '';

      const srcobj = {
        src: path.format({
          dir: rootPath,
          base: '/' + path.relative(resourceBaseUrl, fullName)
        }),
        alt: item
      };
      if(imageReg.test(ext)) {
        // 图片
        type = 'image';
        sources.imageList.push(srcobj);
        tree.files.push({
          ...srcobj,
          type
        });
      } else if(videoReg.test(ext)) {
        // 视频
        type = 'video';
        const bp = encodeURIComponent(path.relative(resourceBaseUrl, fullName));
        const tempObj = {
          ...srcobj,
          sourcrPath: path.format({
            dir: rootPath,
            base: '/play/' + bp
          }),
          posterPath: path.format({
            dir: rootPath,
            base: '/poster/' + bp
          })
        };
        sources.videoList.push(tempObj);
        tree.files.push({
          ...tempObj,
          type
        });
      }
    }
  }
}

async function saveInfo(url, obj) {
  await fsWriteFile(path.join(url, FILES_INFO_NAME), JSON.stringify(obj));
}

async function readInfo(url) {
  const str = await fsReadFile(url);
  return JSON.parse(str);
}

async function refreshFilesInfo(url) {
  resourceBaseUrl = url;
  await getFiles(url);
  console.log('------ got files info successfully ! ------');
  await saveInfo(__dirname, sources);
  console.log('------ saved files info successfully ! ------');
}

// 初始化
async function init(url, { hasInput = true, host = '/' } = { hasInput: true, host: '/' }) {
  rootPath = host
  try {
    await fsAccess(path.join(__dirname, FILES_INFO_NAME));
    const kw = hasInput ? (await getInputKeywords()).toLowerCase() : 'n';
    if(kw === 'n' || kw === 'no') {
      await refreshFilesInfo(url);
    } else {
      const info = await readInfo(path.join(__dirname, FILES_INFO_NAME));
      sources.dirsTree = info.dirsTree || {};
      sources.imageList = info.imageList || [];
      sources.videoList = info.videoList || [];
    }
  } catch(err) {
    await refreshFilesInfo(url);
  }
}

async function getInputKeywords() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question(
      'get the info buy the existing file ? ( yes / no ): ',
      answer => {
        rl.close();
        resolve(answer);
      }
    );
  })
}

module.exports = {
  init,
  sources
}
