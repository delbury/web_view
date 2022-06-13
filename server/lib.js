const fs = require('fs');
const promisify = require('util').promisify;
const fsWriteFile = promisify(fs.writeFile);
const cpuCount = require("os").cpus().length;

const {
  init,
  sources,
} = require('./modules/getFiles');

const {
  HOST,
  SOURCE_DIRS,
  ERROR_LOG_FILE,
} = require('./config');
const tools = require('./modules/tools'); // shuffle

// 初始化
const initData = async ({ forceReload = false } = {}) => {
  // 过滤文件夹列表
  const filteredSourceDirs = await tools.filterExistDirs(SOURCE_DIRS, true);

  // 获取本地资源列表
  const localTrees = await init(
    [...filteredSourceDirs],
    { hasInput: false, host: HOST, forceReload }
  );
  const trees = localTrees.length ? localTrees : sources;

  let randomImages = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.imageList)));
  let randomVideos = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.videoList)));
  let randomAudios = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.audioList)));

  return {
    trees,
    filteredSourceDirs,
    randomImages,
    randomVideos,
    randomAudios
  };
}

// 记录log
async function recordLog(err, webError = false, path = ERROR_LOG_FILE) {
  const date = tools.getCurrentDateTime();
  try {
    let log = '';
    let place = webError ? 'WebError: ' : '';
    if (err instanceof String) {
      log = `${date} >>> ${err.code || ' --- '}: ${err.message || '-'}\r\n${err.info ? `${err.info}\r\n` : ''}`;
    } else {
      log = `${date} >>> ${err}\r\n`;
    }
    await fsWriteFile(path, place + log, { flag: 'a' });
  } catch (err) {
    throw err;
  }
};

// 参数处理
const parseArgs = (args) => {
  let instanceCount = cpuCount;
  const iFlagIndex = args.indexOf('--i');
  if(iFlagIndex > -1 && args[iFlagIndex + 1]) {
    const ic = parseInt(args[iFlagIndex + 1]) || cpuCount;
    instanceCount = Math.min(instanceCount, ic)
  }
  
  return {
    // 是否强制生成文件结构
    forceReload: process.argv.includes('--f'),
    // 集群模式的 fork 数量
    instanceCount,
  }
};

module.exports = {
  initData,
  recordLog,
  parseArgs,
};