/**
 * @description 本地静态文件服务器
 * process.argv：
 *  -f: 强制重新获取文件结构
 */

const Koa = require('koa');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const promisify = require('util').promisify;
const fsWriteFile = promisify(fs.writeFile);

const tools = require('./modules/tools'); // shuffle
const {
  excludeErrorCodes,
  ERROR_LOG_FILE,
} = require('./config');
const { createRouter } = require('./router');
const { initData } = require('./lib');
const { createInstance } = require('./instance');

const cpuCount = require("os").cpus().length;

main();

async function main() {
  const initedData = await initData();

  createInstance(initedData);
};

