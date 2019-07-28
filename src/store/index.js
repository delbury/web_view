import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { GET_TREE, SET_IMAGES_FOLDER } from './action';

const defaultState = {
  tree: [],
  imagesFolder: {}
}

const reducer = (state = defaultState, action) => {
  switch (action.type){
    case GET_TREE: 
      return {
        ...state,
        tree: action.value
      };
    case SET_IMAGES_FOLDER:
      return {
        ...state,
        imagesFolder: action.value
      }
    default: 
      return state;
  }
}

//创建store
const store = createStore(reducer, applyMiddleware(thunk));

export default store;
