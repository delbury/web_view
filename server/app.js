const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');
const static = require('koa-static');
// const range = require('koa-range');
const expert = require('chai').expect;
const fs = require('fs');
const promisify= require('util').promisify;
const fsReadFile = promisify(fs.readFile);

const tools = require('./modules/tools'); // shuffle
const {
  init,
  sources: { dirsTree, imageList, videoList }
} = require('./modules/getFiles');
const HOST = 'http://192.168.0.104:4000';
const SOURCE_DIR = path.join(__dirname, '/pd');

// 主体
(async () => {
  // 获取本地资源列表
  await init(path.resolve(__dirname, './pd'), { hasInput: false, host: HOST });
  let randomImages = tools.shuffle(imageList);
  let randomVideos = tools.shuffle(videoList);

  const app = new Koa();
  const router = new Router();

  router
  // 随机图片
  .get('/images/random', async ctx => {
    
    ctx.body = {
      code: 0,
      // data: randomImages,
      msg: 'successed',
      ...tools.computedResource(ctx, randomImages)
    }
  })
  // 随机视频
  .get('/videos/random', async ctx => {
    const { pageNum, pageSize } = ctx.query;
    ctx.body = {
      code: 0,
      // data: randomVideos,
      msg: 'successed',
      ...tools.computedResource(ctx, randomVideos)
    }
  })
  // 文件结构
  .get('/tree', async ctx => {
    const { ids } = ctx.query;
    ctx.body = {
      code: 0,
      msg: 'successed',
      // ...tools.getTree(dirsTree, ids)
      data: [dirsTree]
    }
  })
  // 播放视频
  .get('/play/:path', async (ctx, next) => {
    const rspath = ctx.params.path;
    console.log(rspath);
    const file = await fsReadFile(path.join(SOURCE_DIR, rspath));
    const total = file.length;
    ctx.set({
      'Content-Range': `bytes ${0}-${total - 1}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': total,
      'Content-Type': 'video/mp4'
    });

    ctx.body = file;
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

  app.on('error', err => console.log(err));

  app
    .use(static(path.join(__dirname, '/pd')))
    .use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', "*");
      await next();
    })
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(4000, () => {
    console.log('Server started successfully!');
  });
})();
