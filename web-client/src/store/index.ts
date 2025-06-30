import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import heroesReducer from './slices/heroesSlice';
import inventoryReducer from './slices/inventorySlice';
import battleReducer from './slices/battleSlice';
import cityReducer from './slices/citySlice';
import uiReducer from './slices/uiSlice';
import websocketReducer from './slices/websocketSlice';
import { apiSlice } from './slices/apiSlice';
import { gameMiddleware } from './middleware/gameMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    heroes: heroesReducer,
    inventory: inventoryReducer,
    battle: battleReducer,
    city: cityReducer,
    ui: uiReducer,
    websocket: websocketReducer,
    api: apiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          // 忽略包含不可序列化值的action
          'websocket/messageReceived',
          'battle/addAnimation',
          'game/updateServerTime',
          // 忽略监听器中间件的内部action
          'listenerMiddleware/add',
          'listenerMiddleware/removeAll',
        ],
        ignoredActionsPaths: [
          'payload.timestamp',
          'payload.callback',
          'meta.arg.onSuccess',
          'meta.arg.onError',
          'meta.listenerApi',
        ],
        ignoredPaths: [
          'websocket.connection',
          'api.queries',
          'api.mutations',
          'listenerMiddleware',
        ],
      },
    })
      .concat(apiSlice.middleware)
      .prepend(gameMiddleware.middleware),
  devTools: import.meta.env.DEV,
});

// 启用查询缓存和重新获取功能
setupListeners(store.dispatch);

// 类型定义（内部使用）
type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出类型化的hooks
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector as any;

// 导出store实例供外部使用
export { store as default };
