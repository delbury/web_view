const ffmpeg = require('ffmpeg');
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
        }
        reject(false);
      })
    }, function (err) {
      console.log('Error: ' + err);
      reject(false);
    });
  });
}

module.exports = {
  getVideoTotalDuration,
  getVideoSceenshots
}
