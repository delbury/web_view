/**
 * @description 本地静态文件服务器
 * process.argv：
 *  --f: 强制重新获取文件结构
 *  --i [number]: 集群的实例数量
 */

const { initData, parseArgs } = require('./lib');
const { createInstance } = require('./instance');
const cluster = require('cluster');

main();

async function main() {
  if(cluster.isMaster || cluster.isPrimary) {
    const args = parseArgs(process.argv);
    // 创建初始化数据
    const initedData = await initData({
      forceReload: args.forceReload,
    });

    // 创建集群
    
    for(let i = 0; i < args.instanceCount; i++) {
      const worker = cluster.fork();
      worker.send({
        type: 'init',
        data: initedData,
      });
    }

    cluster.on('listening', (worker, address) => {
      console.log(`listening worker ${worker.process.pid} on port ${address.port}`);
    });
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} was closed because of ${signal || code}, restarting...`);
      const newWorker = cluster.fork();
      newWorker.send({
        type: 'init',
        data: initedData,
      });
    });
  } else {
    // 创建 server
    process.on('message', (msg) => {
      if(msg.type === 'init') {
        createInstance(msg.data);
      }
    });
  }
};

