import axios from 'axios';
const HOST = window.API_BASE_URL;

// 获取随机图片
export const getRandomImages = async (ars) => {
  return await axios.get(HOST + '/images/random', {
    params: ars
  });
};

// 获取随机视频
export const getRandomVideos = async (ars) => {
  return await axios.get(HOST + '/videos/random', {
    params: ars
  });
};

// 获取文件夹结构树
export const getTree = async (ars) => {
  return await axios.get(HOST + '/tree', {
    params: ars
  });
};

// 打开pdf
export const openPdf = (url) => {
  window.open(HOST + url);
};


export function consoleTest(value) {
  window.fetch(HOST + '/test?value=' + value, {
    method: 'get',
  });
}

