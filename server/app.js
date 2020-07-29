const Koa = require('koa');
const path = require('path').posix;
const Router = require('koa-router');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
// const koaOnerror = require('koa-onerror');
// const range = require('koa-range');
// const expert = require('chai').expect;
const fs = require('fs');
const promisify = require('util').promisify;
const fsReadFile = promisify(fs.readFile);
const fsRename = promisify(fs.rename);
const fsAccess = promisify(fs.access);
const fsStat = promisify(fs.stat);
const fsWriteFile = promisify(fs.writeFile);

const crypto = require('crypto');
const winattr = require('winattr');

const ffmpeg = require('./modules/ffmpeg');
const tools = require('./modules/tools'); // shuffle
let {
  init,
  sources,
  saveFileStat
} = require('./modules/getFiles');
const {
  HOST,
  INFO_FILES_DIR,
  SOURCE_DIRS,
  excludeErrorCodes,
  ERROR_LOG_FILE,
} = require('./config');

// 记录log
async function recordLog(err, webError = false, path = ERROR_LOG_FILE) {
  const date = tools.getCurrentDateTime();
  try {
    let log = '';
    let place = webError ? 'WebError: ' : '';
    if (err instanceof String) {
      log = `${date} >>> ${err.code || ' --- '}: ${err.message || '-'}\r\n${err.info ? `${err.info}\r\n` : ''}`;
    } else {
      log = `${date} >>> ${err}\r\n`;
    }
    await fsWriteFile(path, place + log, { flag: 'a' });
  } catch (err) {
    throw err;
  }
}

// 主体
(async () => {
  // 获取本地资源列表
  const localTrees = await init(
    [...SOURCE_DIRS],
    { hasInput: false, host: HOST, forceReload: false }
  );
  const trees = localTrees.length ? localTrees : sources;

  // if (trees) {
  //   // dirsTree = trees[0].dirsTree || {};
  //   // imageList = trees[0].imageList || [];
  //   // videoList = trees[0].videoList || [];

  //   imageList = [];
  //   videoList = [];
  // }
  let randomImages = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.imageList)));
  let randomVideos = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.videoList)));
  let randomAudios = tools.shuffle(Array.prototype.concat.apply([], trees.map(it => it.audioList)));

  const app = new Koa();
  const router = new Router();

  router
    // 重新随机排列照片
    .post('/images/shuffle', async ctx => {
      randomImages = tools.shuffle(randomImages);
      ctx.body = {
        code: 0,
        msg: 'successed',
        data: null
      };
    })
    // 每一次返回不同的随机图片
    .get('/images/each-random', async ctx => {
      ctx.body = {
        code: 0,
        msg: 'successed',
        ...tools.eachRandomResource(ctx, randomImages)
      };
    })
    // 每一次返回不同的随机音频
    .get('/audio/each-random', async ctx => {
      ctx.body = {
        code: 0,
        msg: 'successed',
        ...tools.eachRandomResource(ctx, randomAudios)
      };
    })
    // 随机图片
    .get('/images/random', async ctx => {
      ctx.body = {
        code: 0,
        // data: randomImages,
        msg: 'successed',
        ...tools.computedResource(ctx, randomImages)
      };
    })
    // 随机视频
    .get('/videos/random', async ctx => {
      ctx.body = {
        code: 0,
        // data: randomVideos,
        msg: 'successed',
        ...tools.computedResource(ctx, randomVideos)
      };
    })
    // 文件结构
    .get('/tree', async ctx => {
      // const { ids } = ctx.query;
      ctx.body = {
        code: 0,
        msg: 'successed',
        // ...tools.getTree(dirsTree, ids)
        data: [...trees.map(it => it.dirsTree)]
      };
    })
    // 播放视频
    .get('/play/:path/:sourceIndex', async ctx => {
      const sourceIndex = ctx.params.sourceIndex;
      const rspath = path.join(
        SOURCE_DIRS[sourceIndex],
        decodeURIComponent(ctx.params.path)
      );
      
      const isMP3 = /\.mp3$/.test(rspath)

      let res = null;
      // 获取资源信息
      try {
        res = await fsStat(rspath);
      } catch (err) {
        console.log(false)
        ctx.status = 404;
        throw err;
      }

      // 获取 range 信息
      const range = ctx.headers.range;
      // console.log(ctx.headers);
      if (range) {
        const positions = range.replace(/bytes=/, '').split('-');

        const total = res ? res.size : 0;
        const start = Number(positions[0]);
        let end = Number(positions[1] || (total - 1));
        if (positions[1]) {
          end = Math.min(Number(positions[1]), start + 2 ** 22);
        } else {
          end = start + 2 ** 22;
          if (end > total - 1) {
            end = total - 1;
          }
        }
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': isMP3 ? 'audio/mp3' : 'video/mp4'
        }

        // 视频流
        // console.log(start.toString().padStart(16, ' '), end.toString().padStart(16, ' '))
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
    .get('/poster/:path/:sourceIndex', async ctx => {
      const rspath = decodeURIComponent(ctx.params.path); // 路由参数路径
      const sourceIndex = ctx.params.sourceIndex;
      const fullpath = path.join(SOURCE_DIRS[sourceIndex], rspath); // 完整资源路径
      const dirname = path.dirname(fullpath); // 资源所在文件夹
      const md5 = crypto.createHash('md5');
      md5.update(rspath);
      const name = md5.digest('hex'); // poster 名，不包括扩展名

      const posterPath = path.join(dirname, name + '.poster');
      let errFlag = false;
      try {
        await fsAccess(posterPath);
      } catch (err) {
        try {
          const res = await ffmpeg.getVideoSceenshots(fullpath, dirname, name);
          if (res) {
            const posterPath = path.join(dirname, name + '_1.jpg'); // poster 完整路径名
            const rePath = path.join(dirname, name + '.poster');
            await fsRename(posterPath, rePath);
            await new Promise(resolve => {
              winattr.set(rePath, { hidden: true }, () => resolve());
            });
            saveFileStat(INFO_FILES_DIR, await fsStat(SOURCE_DIRS[sourceIndex]), sourceIndex); // 更新状态文件
          }
        } catch (err) {
          errFlag = true;
          console.log('got poster failed ! ', err);
          throw err;
        }
      } finally {
        if (!errFlag) {
          const poster = await fsReadFile(posterPath);
          ctx.set('Content-Type', 'image/jpeg');
          ctx.body = poster;
        } else {
          ctx.status = 500;
        }
      }
    })
    // 记录日志    
    .post('/log', async ctx => {
      try {
        await recordLog(ctx.query.msg, true);
        ctx.body = {
          code: 0,
          msg: 'successed',
        }
      } catch (err) {
        ctx.status = 500
      }

    })
    .post('/console', async ctx => {
      console.log('info text: ' + ctx.request.body.msg);
      ctx.body = {
        code: 0,
        msg: 'successed'
      }
    })
    .all('*', async ctx => {
      ctx.status = 404;
    });

  app.on('error', err => {
    const errCode = err.code;
    if (!excludeErrorCodes.includes(errCode)) {
      let msg = 'An error occured : ' + errCode;
      console.log(Array(60).fill('*').join(''));
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

  for (let key in SOURCE_DIRS) {
    app.use(koaStatic(SOURCE_DIRS[key], {
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
})();

module.exports = {
  SOURCE_DIRS
}
