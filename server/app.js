const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');
const koaStatic = require('koa-static');
// const koaOnerror = require('koa-onerror');
// const range = require('koa-range');
const expert = require('chai').expect;
const fs = require('fs');
const promisify= require('util').promisify;
const fsReadFile = promisify(fs.readFile);
const fsRename = promisify(fs.rename);
const fsAccess = promisify(fs.access);

const crypto = require('crypto');

const ffmpeg = require('./modules/ffmpeg');
const tools = require('./modules/tools'); // shuffle
const {
  init,
  sources: { dirsTree, imageList, videoList }
} = require('./modules/getFiles');
const HOST = ''; // 'http://192.168.0.104:4000'
const SOURCE_DIR = path.join(__dirname, '/pd');
const excludeErrorCodes = ['ECONNRESET', 'ECONNABORTED'];

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
    ctx.body = {
      code: 0,
      // data: randomVideos,
      msg: 'successed',
      ...tools.computedResource(ctx, randomVideos)
    }
  })
  // 文件结构
  .get('/tree', async ctx => {
    // const { ids } = ctx.query;
    ctx.body = {
      code: 0,
      msg: 'successed',
      // ...tools.getTree(dirsTree, ids)
      data: [dirsTree]
    }
  })
  // 播放视频
  .get('/play/:path', async ctx => {
    const rspath = decodeURIComponent(ctx.params.path);
    const range = ctx.headers.range;

    const positions = range.replace(/bytes=/, '').split('-');
    const file = await fsReadFile(path.join(SOURCE_DIR, rspath));
    const total = file.length;
    const start = Number(positions[0]);
    const end = Number(positions[1] || (total - 1))
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
      // 'Keep-Alive': 'timeout=5, max=100'
    }
    ctx.set(headers);

    ctx.status = 206;
    ctx.body = file.slice(start, end + 1);
  })
  // .get('/play/:path', async ctx => {
  //   const rspath = decodeURIComponent(ctx.params.path);
  //   const range = ctx.headers.range;

  //   console.log('---------------------------------   ' + ctx.headers['x-playback-session-id']);
  //   console.log(JSON.stringify(ctx.headers, null, 2));

  //   const positions = range.replace(/bytes=/, '').split('-');
  //   const file = await fsReadFile(path.join(SOURCE_DIR, rspath));
  //   const total = file.length;
  //   const start = Number(positions[0]);
  //   const end = Number(positions[1] || (total - 1))
  //   const headers = {
  //     'Content-Range': `bytes ${start}-${end}/${total}`,
  //     'Accept-Ranges': 'bytes',
  //     'Content-Length': end - start + 1,
  //     'Content-Type': 'video/mp4',
  //     // 'Keep-Alive': 'timeout=5, max=100'
  //   }
  //   ctx.set(headers);

  //   console.log('***************    ');
  //   console.log(JSON.stringify(headers, null, 2))
  //   console.log('----------------------------------------')
  //   ctx.status = 206;
  //   ctx.body = file.slice(start, end + 1);
  // })
  // 获取 poster
  .get('/poster/:path', async ctx => {
    const rspath = decodeURIComponent(ctx.params.path); // 路由参数路径
    const fullpath = path.join(SOURCE_DIR, rspath); // 完整资源路径
    const dirname = path.dirname(fullpath); // 资源所在文件夹
    const md5 = crypto.createHash('md5');
    md5.update(rspath);
    const name = md5.digest('hex'); // poster 名，不包括扩展名

    const posterPath = path.join(dirname, name + '.poster');
    try {
      await fsAccess(posterPath);
    } catch(err) {
      const res = await ffmpeg.getVideoSceenshots(fullpath, dirname, name);
      if(res) {
        const posterPath = path.join(dirname, name + '_1.jpg'); // poster 完整路径名
        await fsRename(posterPath, path.join(dirname, name + '.poster'));
      }
    } finally {
      const poster = await fsReadFile(posterPath);
      ctx.set('Content-Type', 'image/jpeg');
      ctx.body = poster;
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

  app.on('error', err => {
    const errCode = err.code;
    if(!excludeErrorCodes.includes(errCode)) {
      let msg = 'An error occured : ' + errCode;
      console.log(Array(60).fill('*').join(''));
      console.log(err);
      console.log(Array(60).fill('*').join(''));
    }
  });

  app
    .use(koaStatic(path.join(__dirname, '/pd')))
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
