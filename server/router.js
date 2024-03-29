const fs = require('fs');
const path = require('path').posix;
const child_process = require('child_process');
const crypto = require('crypto');

const promisify = require('util').promisify;
const fsStat = promisify(fs.stat);
const fsAccess = promisify(fs.access);
const fsRename = promisify(fs.rename);
const fsReadFile = promisify(fs.readFile);

const Router = require('koa-router');
const winattr = require('winattr');

const tools = require('./modules/tools'); // shuffle
// const ffmpeg = require('./modules/ffmpeg');
const { saveFileStat } = require('./modules/getFiles');
const { INFO_FILES_DIR } = require('./config');
const { recordLog } = require('./lib');

// 创建路由
const createRouter = ({
  filteredSourceDirs,
  randomImages,
  randomVideos,
  randomAudios,
  trees,
}) => {
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
      const size = +ctx.params.size || undefined;

      ctx.body = {
        code: 0,
        // data: randomVideos,
        msg: 'successed',
        ...tools.computedRandomResource(randomVideos, size)
      };
    })
    // 文件结构
    .get('/tree', async ctx => {
      ctx.body = {
        code: 0,
        msg: 'successed',
        data: [...trees.map(it => it.dirsTree)]
      };
    })
    // 播放视频
    .get('/play/:path/:sourceIndex', async ctx => {
      const sourceIndex = ctx.params.sourceIndex;
      const rspath = path.join(
        filteredSourceDirs[sourceIndex],
        decodeURIComponent(ctx.params.path)
      );
      
      const isMP3 = /\.mp3$/.test(rspath)

      let res = null;
      // 获取资源信息
      try {
        res = await fsStat(rspath);
      } catch (err) {
        ctx.status = 404;
        throw err;
      }

      // 获取 range 信息
      const range = ctx.headers.range;
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
    // 获取 poster
    .get('/poster/:path/:sourceIndex', async ctx => {
      const rspath = decodeURIComponent(ctx.params.path); // 路由参数路径
      const sourceIndex = ctx.params.sourceIndex;
      const fullpath = path.join(filteredSourceDirs[sourceIndex], rspath); // 完整资源路径
      const dirname = path.dirname(fullpath); // 资源所在文件夹
      const filename = path.basename(fullpath); // 文件名称
      const md5 = crypto.createHash('md5');
      md5.update(filename);
      const md5Name = md5.digest('hex'); // poster 名，不包括扩展名

      const posterPath = path.join(dirname, md5Name + '.poster');
      let errFlag = false;
      try {
        await fsAccess(posterPath);
      } catch (err) {
        try {
          // 获取第一帧
          // const res = await ffmpeg.getVideoSceenshots(fullpath, dirname, md5Name);
          const posterPath = path.join(dirname, md5Name + '.jpg'); // poster 完整路径名
          const rePath = path.join(dirname, md5Name + '.poster');
          const res = await new Promise((resolve, reject) => {
            child_process.exec(
              [ 
                'ffmpeg',
                '-y',
                '-ss', '1.0', '-i', `"${fullpath}"`,
                '-vf', `scale=128:-1`,
                '-frames:v', '1', '-q:v', '5', '-an',
                `"${posterPath}"`,
                '-hide_banner'
              ].join(' '),
              {},
              (err, stdout, stderr) => {
                if(err) {
                  console.log('created ticks failed .');
                  console.log(err);
                  resolve(false);
                } else {
                  resolve(true);
                }
              }
            );
          });
          if (res) {
            await fsRename(posterPath, rePath);
            await new Promise(resolve => {
              winattr.set(rePath, { hidden: true }, () => resolve());
            });
            saveFileStat(INFO_FILES_DIR, await fsStat(filteredSourceDirs[sourceIndex]), sourceIndex); // 更新状态文件
          } else {
            errFlag = true;
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

  return router;
};

module.exports = {
  createRouter,
  recordLog,
};
