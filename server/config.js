const path = require('path').posix;

const HOST = ''; // 'http://192.168.0.103:4000'
const INFO_FILES_DIR = path.join(__dirname, './modules');

// 文件服务器
const SOURCE_DIRS = ['F:/资源/pd', 'G:/BaiduNetdiskDownload', 'E:/game/others', '/Users/bytedance/Movies']; // 全部静态文件夹

const excludeErrorCodes = ['ECONNRESET', 'ECONNABORTED'];
const ERROR_LOG_FILE = path.join(__dirname, './error.log');

module.exports = {
  HOST,
  INFO_FILES_DIR,
  SOURCE_DIRS,
  excludeErrorCodes,
  ERROR_LOG_FILE,
}