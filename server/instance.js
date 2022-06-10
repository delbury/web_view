const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const koaStatic = require('koa-static');

const { createRouter, recordLog } = require('./router');
const {
  excludeErrorCodes,
} = require('./config');

const createInstance = (initedData) => {
  const app = new Koa();
  const router = createRouter(initedData);

  app.on('error', err => {
    const errCode = err.code;
    if (!excludeErrorCodes.includes(errCode)) {
      let msg = 'An error occured : ' + errCode;
      console.log(Array(60).fill('*').join(''));
      console.log(msg);
      console.log(err);
      console.log(Array(60).fill('*').join(''));
    }
    recordLog(err);
  });

  app
    .use(bodyParser())
    .use(async (ctx, next) => {
      // 缓存控制
      if (ctx.headers['accept'].indexOf('image') > -1) {
        ctx.set('Cache-Control', 'max-age=1800');
      }
      await next();
    });
  
  // 将每一个文件夹添加为静态目录
  for (let dir of initedData.filteredSourceDirs) {
    app.use(koaStatic(dir, {
      setHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
    }));
  }

  app
    .use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*');
      await next();
    })
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(4000, () => {
    console.log('Server started successfully!');
  });
};

module.exports = {
  createInstance,
}