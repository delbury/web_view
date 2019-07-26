const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');

const tools = require('./modules/tools'); // shuffle
const {
  init,
  sources: { dirsTree, imageList, videoList }
} = require('./modules/getFiles');

// 主体
(async () => {
  // 获取本地资源列表
  await init(path.resolve(__dirname, './test-resources'), { hasInput: false });

  const app = new Koa();
  const router = new Router();
  router
  .get('/images/random', async ctx => {
    ctx.body = {
      code: 0,
      data: tools.shuffle(imageList),
      msg: 'successed'
    }
  })
  .get('/videos/random', async ctx => {
    ctx.body = {
      code: 0,
      data: tools.shuffle(videoList),
      msg: 'successed'
    }
  })
  .get('/filestree', async ctx => {
    ctx.body = {
      code: 0,
      data: dirsTree,
      msg: 'successed'
    }
  })
  .all('*', async ctx => {
    ctx.status = 404;
  });

  app
    .use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', "*");
      next();
    })
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(4000);
})();
