import axios from 'axios';
// const HOST = 'http://192.168.0.104:4000';
const HOST = process.env.REACT_APP_API_BASE_URL;

export const getRandomImages = async (ars) => {
  return await axios.get(HOST + '/images/random', {
    params: ars
  });
};

export const getRandomVideos = async (ars) => {
  return await axios.get(HOST + '/videos/random', {
    params: ars
  });
};

export const getTree = async (ars) => {
  return await axios.get(HOST + '/tree', {
    params: ars
  });
};
