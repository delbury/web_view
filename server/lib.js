const {
  init,
  sources,
} = require('./modules/getFiles');
const {
  HOST,
  SOURCE_DIRS,
} = require('./config');
const tools = require('./modules/tools'); // shuffle

// 初始化
const initData = async () => {
  // 过滤文件夹列表
  const filteredSourceDirs = await tools.filterExistDirs(SOURCE_DIRS, true);

  // 获取本地资源列表
  const localTrees = await init(
    [...filteredSourceDirs],
    { hasInput: false, host: HOST, forceReload: process.argv.includes('-f') }
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

module.exports = {
  initData,
};