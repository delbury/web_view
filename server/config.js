const path = require('path').posix;

const HOST = ''; // 'http://192.168.0.103:4000'
const INFO_FILES_DIR = path.join(__dirname, './modules');

// 文件服务器
// 全部静态文件夹
const SOURCE_DIRS = [
  'D:/enjoy/others/one',
  'D:/enjoy/others/two',
  'D:/enjoy/others/three',
  'D:/enjoy/others/comic',
  'D:/enjoy/others/bts',
  'D:/enjoy/others/ai',
  'D:/enjoy/others/shared',
  'D:/enjoy/others/tele',
  'D:/enjoy/others/fenlei',
];

const excludeErrorCodes = ['ECONNRESET', 'ECONNABORTED'];
const ERROR_LOG_FILE = path.join(__dirname, './error.log');

module.exports = {
  HOST,
  INFO_FILES_DIR,
  SOURCE_DIRS,
  excludeErrorCodes,
  ERROR_LOG_FILE,
}