import { getTree } from '../api';

export const GET_TREE = 'GET_TREE';
export const SET_IMAGES_FOLDER = 'SET_IMAGES_FOLDER';

export const SET_IMAGES_HAMMER = 'SET_IMAGES_HAMMER';
export const CLEAR_IMAGES_HAMMER = 'CLEAR_IMAGES_HAMMER';

const getTreeAction = (content) => ({
  type: GET_TREE,
  value: content.value
});

export const getTreeActionAsync = () => {
  return async dispatch => {
    const res = (await getTree()).data;
    dispatch(getTreeAction({ value: res.data }));
  };
};

export const setSelectedImagesFolder = (content) => ({
  type: SET_IMAGES_FOLDER,
  value: content.data
});

export const setImagesHammer = (content) => ({
  type: SET_IMAGES_HAMMER,
  value: content.data
});

export const clearImagesHammer = () => ({
  type: CLEAR_IMAGES_HAMMER
});
