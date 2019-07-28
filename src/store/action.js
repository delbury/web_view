import { getTree } from '../api';

export const GET_TREE = 'GET_TREE';
export const SET_IMAGES_FOLDER = 'SET_IMAGES_FOLDER';

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
