import {createStore,combineReducers,applyMiddleware} from 'redux';
import createThunkErrorHandlerMiddleware from 'redux-thunk-error-handler';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { MMKV } from 'react-native-mmkv';
import { persistReducer } from 'redux-persist';

import app from './reducers/app';

const storage = new MMKV();

export const redux_storage = {
    setItem: (key, value) => {
      storage.set(key, value)
      return Promise.resolve(true)
    },
    getItem: (key) => {
      const value = storage.getString(key)
      return Promise.resolve(value)
    },
    removeItem: (key) => {
      storage.delete(key)
      return Promise.resolve()
    }
};

const persist_config = {
    version:1,
    key: 'root',
    storage:redux_storage,
    whitelist:['app']
};


const root_reducer = combineReducers({app});
const persisted_reducer = persistReducer(persist_config, root_reducer)
const error_handle_middleware = createThunkErrorHandlerMiddleware({onError:()=>{ }});



const configure_store = () => {
    if(__DEV__){
          return createStore(persisted_reducer,applyMiddleware(error_handle_middleware,thunk,logger));
    }
    return createStore(persisted_reducer,applyMiddleware(error_handle_middleware,thunk));
};

export default configure_store;