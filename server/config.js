const path = require('path').posix;

const HOST = ''; // 'http://192.168.0.103:4000'
const INFO_FILES_DIR = path.join(__dirname, './modules');
const RESOURCE_BASE_DIR = 'F:/资源'; // 
// const RESOURCE_BASE_DIR = __dirname;
const RESOURCE_DIR_NAME = 'pd';
const SOURCE_DIR = path.join(RESOURCE_BASE_DIR, '/' + RESOURCE_DIR_NAME);
const SOURCE_DIRS = [SOURCE_DIR, 'G:/BaiduNetdiskDownload']; // 全部静态文件夹
// const SOURCE_DIRS = ['G:/learnspace/github/web_view/server/pd', 'G:/books/Web书籍', 'F:/website/test'];
const excludeErrorCodes = ['ECONNRESET', 'ECONNABORTED'];
const ERROR_LOG_FILE = path.join(__dirname, './modules/error.log');

module.exports = {
  HOST,
  INFO_FILES_DIR,
  RESOURCE_BASE_DIR,
  RESOURCE_DIR_NAME,
  SOURCE_DIR,
  SOURCE_DIRS,
  excludeErrorCodes,
  ERROR_LOG_FILE,
}