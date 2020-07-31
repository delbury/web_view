const path = require('path').posix;
const fs = require('fs');
const readline = require('readline');
const expect = require('chai').expect;

const promisify = require('util').promisify;
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsWriteFile = promisify(fs.writeFile);
const fsAccess = promisify(fs.access);
const fsReadFile = promisify(fs.readFile);
const ignoreReg = /^ignore__.*/; // 过滤的文件名前缀
let resourceBaseUrl = '';
let rootPath = '';


const sources = [];

const imageReg = /\.(jpg|jpeg|png|gif)$/i;
const videoReg = /\.(mp4|ogg|webm)$/i;
const audioReg = /\.(mp3|ogg|wav)$/i;
const pdfReg = /\.(pdf)$/i;
const FILES_INFO_NAME = 'files_info';
const FILES_STATS_NAME = 'files_stats';

const files_info_name_list = [];
const files_stats_name_list = [];

const ids = [];

async function getFiles(baseUrl, tree, index) {
  const rootDirName = path.basename(baseUrl);
  tree.dirname = path.basename(rootDirName); // 记录文件夹名称
  tree.id = `_${index}_${ids[index]}`;
  ids[index] = (global.BigInt(ids[index]) + 1n).toString();

  // 获取文件夹下所有文件
  const files = await fsReaddir(baseUrl);
  expect(files).not.to.be.equal(null);
  for await (let item of files.filter(it => !ignoreReg.test(it))) {
    const fullName = path.join(baseUrl, item);
    const stats = await fsStat(fullName);
    expect(stats).not.to.be.equal(null);

    if (stats.isDirectory()) {
      // 是文件夹
      const child = {
        dirname: '',
        children: [],
        files: []
      };
      tree.children.push(child);
      await getFiles(fullName, child, index);
    } else {
      // 否则为文件
      const ext = path.extname(item);
      let type = '';

      const srcobj = {
        src: path.format({
          dir: rootPath,
          base: '/' + path.relative(resourceBaseUrl, fullName)
        }),
        alt: item,
        sourceIndex: index
      };
      if (imageReg.test(ext)) {
        // 图片
        type = 'image';
        sources[index].imageList.push(srcobj);
        tree.files.push({
          ...srcobj,
          type,
          size: stats.size
        });
      } else if (videoReg.test(ext)) {
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
          }),
          size: stats.size
        };
        sources[index].videoList.push(tempObj);
        tree.files.push({
          ...tempObj,
          type
        });
      } else if (audioReg.test(ext)) {
        // 音频
        type = 'audio';
        const bp = encodeURIComponent(path.relative(resourceBaseUrl, fullName));
        sources[index].audioList.push(srcobj);
        let lrcPath = '';
        if(files.includes(item.replace(audioReg, '.lrc'))) {
          lrcPath = '/' + bp.replace(audioReg, '.lrc')
        }
        tree.files.push({
          ...srcobj,
          type,
          size: stats.size,
          sourcrPath: path.format({
            dir: rootPath,
            base: '/play/' + bp
          }),
          lrcPath
        });
      } else if(pdfReg.test(ext)) {
        // pdf
        type = 'pdf';
        sources[index].pdfList.push(srcobj);
        tree.files.push({
          ...srcobj,
          type,
          size: stats.size
        });
      }
    }
  }
}

// 保存文件夹信息
async function saveInfo(url, obj, index) {
  await fsWriteFile(path.join(url, files_info_name_list[index]), JSON.stringify(obj));
}

// 保存修改时间
async function saveFileStat(url, obj, index) {
  await fsWriteFile(path.join(url, files_stats_name_list[index]), JSON.stringify(obj));
}

// 获取保存的信息
async function readInfo(url) {
  const str = await fsReadFile(url);
  return JSON.parse(str);
}

async function refreshFilesInfo(url, index) {
  resourceBaseUrl = url;
  console.log(`------ ${index}: start getting files... ------`);
  await getFiles(url, sources[index].dirsTree, index);
  console.log(`------ ${index}: got files info successfully ! ------`);
  await saveInfo(__dirname, sources[index], index);
  console.log(`------ ${index}: saved files info successfully ! ------`);
}

// 初始化
async function init(urls, { hasInput = true, host = '/', forceReload = false } = { hasInput: true, host: '/' }) {
  for(let index in urls) {
    files_info_name_list[index] = `${FILES_INFO_NAME}_${index}.json`;
    files_stats_name_list[index] = `${FILES_STATS_NAME}_${index}.json`;
    sources[index] = {
      dirsTree: {
        dirname: '',
        children: [],
        files: [],
        id: ''
      },
      imageList: [],
      videoList: [],
      audioList: [],
      pdfList: []
    };
    ids[index] = '0';
  }
  rootPath = host;
  const infos = [];
  for(let index in urls) {
    const url = urls[index];

    let needReloadFiles = false; // 是否需要重新加载文件夹信息

    if(!forceReload) {
      // 判断文件是否被修改
      try {
        await fsAccess(path.join(__dirname, files_stats_name_list[index]));
        const currentStat = await fsStat(url);
        const oldStat = await readInfo(path.join(__dirname, files_stats_name_list[index]));

        // 文件修改过
        if (currentStat.ctimeMs === oldStat.ctimeMs) {
          needReloadFiles = false;
        } else {
          await saveFileStat(__dirname, currentStat, index);
          needReloadFiles = true;
        }
      } catch (err) {
        const stat = await fsStat(url);
        await saveFileStat(__dirname, stat, index);
        needReloadFiles = true;
      }
    }

    try {
      await fsAccess(path.join(__dirname, files_info_name_list[index]));
      const kw = hasInput ? (await getInputKeywords()).toLowerCase() : 'n';
      if (kw === 'n' || kw === 'no') {
        if(forceReload || needReloadFiles) {
          await refreshFilesInfo(url, index)
        } else {
          const info = await readInfo(path.join(__dirname, files_info_name_list[index]));
          infos.push(info);
          continue;
          // return info;
        }
      } else {
        const info = await readInfo(path.join(__dirname, files_info_name_list[index]));
        // sources.dirsTree = info.dirsTree || {};
        // sources.imageList = info.imageList || [];
        // sources.videoList = info.videoList || [];
        infos.push(info);
        continue;
        // return info;
      }
    } catch (err) {
      await refreshFilesInfo(url, index);
    }
  }
  return infos;
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
  sources,
  saveFileStat
}
