import axios from 'axios';
const HOST = 'http://192.168.0.104:4000';

export const getRandomImages = async (ars) => {
  return await axios.get(HOST + '/images/random', {
    params: ars
  });
};
