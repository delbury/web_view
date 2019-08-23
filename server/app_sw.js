const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');
const koaStatic = require('koa-static');
const bodyparser = require('koa-body');
// const koaOnerror = require('koa-onerror');
// const range = require('koa-range');
const expert = require('chai').expect;
const fs = require('fs');
const promisify= require('util').promisify;
const fsReadFile = promisify(fs.readFile);
const fsRename = promisify(fs.rename);
const fsAccess = promisify(fs.access);
const fsStat = promisify(fs.stat);

const crypto = require('crypto');

const ffmpeg = require('./modules/ffmpeg');
const tools = require('./modules/tools'); // shuffle
let {
  init,
  sources: { dirsTree, imageList, videoList }
} = require('./modules/getFiles');
const HOST = ''; // 'http://192.168.0.104:4000'
const SOURCE_DIR = path.join(__dirname, '/pd');
const excludeErrorCodes = ['ECONNRESET', 'ECONNABORTED'];

const webpush = require('web-push');
const subscriptions = [];
let timer = null;

// 主体
(async () => {
  // web-push
  // const vapidKeys = webpush.generateVAPIDKeys();
  const vapidKeys = {
    publicKey: 'BC21fA4DIGmpLLMHDCcdJDfuytliEghSk_O0Sds5ou7wSlvZq_NYkq7K3pMHOQb2NwVwfJnG-DiTh0sy7hdgtWs',
    privateKey: 'sIru4ETF-UJY0v00_rGyJ2KiDqCt4GeC7tOsES0T8pM'
  };
  webpush.setVapidDetails(
    'mailto:hujiqing@233.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  // 获取本地资源列表
  const localTree = await init(path.resolve(__dirname, './pd'), { hasInput: false, host: HOST });
  if(localTree) {
    dirsTree = localTree.dirsTree || {};
    imageList = localTree.imageList || [];
    videoList = localTree.videoList || [];
  }
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
    const rspath = path.join(
      SOURCE_DIR,
      decodeURIComponent(ctx.params.path)
    );
    let res = null;
    // 获取资源信息
    try {
      res = await fsStat(rspath);
    } catch (err) {
      ctx.status = 404;
      return;
    }

    // 获取 range 信息
    const range = ctx.headers.range;
    if (range) {
      const positions = range.replace(/bytes=/, '').split('-');

      const total = res ? res.size : 0;
      const start = Number(positions[0]);
      let end = Number(positions[1] || (total - 1));
      if(positions[1]) {
        end = Number(positions[1]);
      } else {
        end = start + 2 ** 18;
        if(end > total - 1) {
          end = total - 1;
        }
      }
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4'
      }

      // 视频流
      const vs = fs.createReadStream(rspath, {
        start,
        end
      });
      await new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        vs.on('data', data => {
          chunks.push(data);
          size += data.length;
        })
        vs.on('end', () => {
          const buffer = Buffer.concat(chunks, size);
          ctx.status = (start === 0 && end === 1) ? 200 : 206; 
          ctx.set(headers);
          ctx.body = buffer;
          resolve();
        });
        vs.on('error', () => {
          reject();
        });
      });
    }
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
    let errFlag = false;
    try {
      await fsAccess(posterPath);
    } catch(err) {
      try {
        const res = await ffmpeg.getVideoSceenshots(fullpath, dirname, name);
        if(res) {
          const posterPath = path.join(dirname, name + '_1.jpg'); // poster 完整路径名
          await fsRename(posterPath, path.join(dirname, name + '.poster'));
        }
      } catch (err) {
        errFlag = true;
        console.log('got poster failed ! ', err);
      }
    } finally {
      if(!errFlag) {
        const poster = await fsReadFile(posterPath);
        ctx.set('Content-Type', 'image/jpeg');
        ctx.body = poster;
      } else {
        ctx.status = 500;
      }
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
  .post('/subscription', async ctx => {
    const subscription = JSON.parse(ctx.request.body).subscription;
    if(subscriptions.every(item => item.endpoint !== subscription.endpoint)) {
      subscriptions.push(subscription);
    }
    const data = {
      content: '请点击',
      options: {
        value: '2333',
        tag: Date.now().toString(),
        icon: 'http://127.0.0.1:82/security/js/cache/apple-icon-128x128.png',
        image: 'http://127.0.0.1:82/security/js/cache/2.jpg',
        actions: [
          { title: '切换', action: 'switch' },
          { title: '打开', action: 'open' }
        ]
      }
    };
    webpush.sendNotification(subscription, JSON.stringify(data))
      .then(res => {
        console.log('pushed !');
      }).catch(err => {
        console.log(err);
      });

    ctx.body = {
      code: 0,
      msg: 'successed'
    };
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
    .use(bodyparser())
    .use(async (ctx, next) => {
      // 缓存控制
      if(ctx.headers['accept'].indexOf('image') > -1) {
        ctx.set('Cache-Control', 'max-age=1800');
      }
      await next();
    })
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
