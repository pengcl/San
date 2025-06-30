import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  rememberMe: localStorage.getItem('remember_me') === 'true',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.rememberMe = action.payload.rememberMe || false;

      // 保存到localStorage
      if (action.payload.rememberMe) {
        localStorage.setItem('auth_token', action.payload.token);
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      } else {
        sessionStorage.setItem('auth_token', action.payload.token);
        sessionStorage.setItem(
          'user_data',
          JSON.stringify(action.payload.user)
        );
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.rememberMe = false;

      // 清除存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('remember_me');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        // 更新存储的用户数据
        const storage = state.rememberMe ? localStorage : sessionStorage;
        storage.setItem('user_data', JSON.stringify(state.user));
      }
    },
    clearError: state => {
      state.error = null;
    },
    // 从存储中恢复认证状态
    restoreAuth: state => {
      const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');
      const userData =
        localStorage.getItem('user_data') ||
        sessionStorage.getItem('user_data');
      const rememberMe = localStorage.getItem('remember_me') === 'true';

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
          state.rememberMe = rememberMe;
        } catch (error) {
          // 数据损坏，清除存储
          localStorage.clear();
          sessionStorage.clear();
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  restoreAuth,
} = authSlice.actions;

// Action creator for simplified login
export const login = (payload: {
  user: User;
  token: string;
  refreshToken?: string;
  rememberMe?: boolean;
}) => {
  return loginSuccess(payload);
};

export default authSlice.reducer;

// 选择器
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
