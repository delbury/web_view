const ffmpeg = require('./ffmpeg/index.js');
const path = require('path');

// 获取时长
function getVideoTotalDuration(videoPath) {
  const pro = new ffmpeg(videoPath);
  return pro.then(function (video) {
    console.log('getVideoTotalDuration,seconds:' + video.metadata.duration.seconds);
    return video.metadata.duration.seconds || 0;
  }, function (err) {
    console.log('getVideoTotalDuration,err:' + err.message);
    return -1;
  })
}

//获取视频缩略图
async function getVideoSceenshots(videoPath, outPutPath, filename, frameRate = 1, frameCount = 1) {
  videoPath = videoPath.split(path.sep).join('/');
  outPutPath = outPutPath.split(path.sep).join('/');
  const pro = new ffmpeg(videoPath);
  return new Promise((resolve, reject) => {
    pro.then(function (video) {
      video.fnExtractFrameToJPG(outPutPath, {
        frame_rate: frameRate,
        number: frameCount,
        file_name: filename
      }, function (error, files) {
        if (!error) {
          console.log('poster saved !');
          resolve(true)
        } else {
          console.log('1.Error: ' + JSON.stringify(error, null, 2));
          reject(false);
        }
      })
    }, function (err) {
      console.log('2.Error: ' + JSON.stringify(err, null, 2));
      reject(false);
    });
  });
}

module.exports = {
  getVideoTotalDuration,
  getVideoSceenshots
}
