import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  GET_TREE,
  SET_IMAGES_FOLDER,
  SET_IMAGES_HAMMER,
  CLEAR_IMAGES_HAMMER,
  LOADING_TREE_CHANGE
} from './action';

const defaultState = {
  tree: [],
  imagesFolder: {},
  imagesHammer: null,
  loadingTree: false
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
    case SET_IMAGES_HAMMER:
      return {
        ...state,
        imagesHammer: action.value
      }
    case CLEAR_IMAGES_HAMMER:
      return {
        ...state,
        imagesHammer: null
      }
    case LOADING_TREE_CHANGE:
      return {
        ...state,
        loadingTree: action.value
      }
    default: 
      return state;
  }
}

//创建store
const store = createStore(reducer, applyMiddleware(thunk));

export default store;
