const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');
const static = require('koa-static');
const expert = require('chai').expect;
// const os = require('os');

const tools = require('./modules/tools'); // shuffle
const {
  init,
  sources: { dirsTree, imageList, videoList }
} = require('./modules/getFiles');
const HOST = 'http://192.168.0.104:4000';
// const nw = os.networkInterfaces();


// 主体
(async () => {
  // 获取本地资源列表
  await init(path.resolve(__dirname, './pd'), { hasInput: false, host: HOST });
  let randomImages = tools.shuffle(imageList);
  let randomVideos = tools.shuffle(videoList);

  const app = new Koa();
  const router = new Router();
  router
  .get('/images/random', async ctx => {
    
    ctx.body = {
      code: 0,
      // data: randomImages,
      msg: 'successed',
      ...tools.computedResource(ctx, randomImages)
    }
  })
  .get('/videos/random', async ctx => {
    const { pageNum, pageSize } = ctx.query;
    ctx.body = {
      code: 0,
      // data: randomVideos,
      msg: 'successed',
      ...tools.computedResource(ctx, randomVideos)
    }
  })
  .get('/tree', async ctx => {
    const { ids } = ctx.query;
    ctx.body = {
      code: 0,
      msg: 'successed',
      // ...tools.getTree(dirsTree, ids)
      data: dirsTree
    }
  })
  .get('/test', async ctx => {
    const { value } = ctx.query;
    console.log('=====================   ', value);
    ctx.body = {
      code: 0,
      msg: 'successed',
    }
  })
  .all('*', async ctx => {
    ctx.status = 404;
  });

  app
    .use(static(path.join(__dirname, '/pd')))
    .use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', "*");
      next();
    })
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(4000, () => {
    console.log('Server started successfully!');
  });
})();
