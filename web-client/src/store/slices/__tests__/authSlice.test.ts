import { configureStore } from '@reduxjs/toolkit';
import {
  authSlice,
  login,
  logout,
  restoreAuth,
  updateProfile,
} from '../authSlice';
import { mockUser, mockApiResponse, mockApiError } from '../../../test/utils';

// Mock API calls
jest.mock('../../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
    });

    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('reducers', () => {
    it('should handle setUser', () => {
      store.dispatch(authSlice.actions.setUser(mockUser));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle setToken', () => {
      const token = 'test-token';
      store.dispatch(authSlice.actions.setToken(token));

      const state = store.getState().auth;
      expect(state.token).toBe(token);
    });

    it('should handle setLoading', () => {
      store.dispatch(authSlice.actions.setLoading(true));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
    });

    it('should handle setError', () => {
      const error = 'Test error';
      store.dispatch(authSlice.actions.setError(error));

      const state = store.getState().auth;
      expect(state.error).toBe(error);
    });

    it('should handle clearError', () => {
      // First set an error
      store.dispatch(authSlice.actions.setError('Test error'));
      expect(store.getState().auth.error).toBe('Test error');

      // Then clear it
      store.dispatch(authSlice.actions.clearError());
      expect(store.getState().auth.error).toBeNull();
    });

    it('should handle clearAuth', () => {
      // First set up authenticated state
      store.dispatch(authSlice.actions.setUser(mockUser));
      store.dispatch(authSlice.actions.setToken('test-token'));

      // Then clear auth
      store.dispatch(authSlice.actions.clearAuth());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });

  describe('async thunks', () => {
    describe('login', () => {
      it('should handle successful login', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const mockResponse = {
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
        };

        const { authAPI } = require('../../../services/api');
        authAPI.login.mockResolvedValue(mockResponse);

        await store.dispatch(login(credentials));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
        expect(state.refreshToken).toBe('refresh-token');
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();

        // Check localStorage
        expect(localStorage.getItem('auth_token')).toBe('access-token');
        expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
      });

      it('should handle login failure', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };
        const errorMessage = 'Invalid credentials';

        const { authAPI } = require('../../../services/api');
        authAPI.login.mockRejectedValue(new Error(errorMessage));

        await store.dispatch(login(credentials));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });

      it('should set loading state during login', () => {
        const credentials = { email: 'test@example.com', password: 'password' };

        const { authAPI } = require('../../../services/api');
        authAPI.login.mockImplementation(() => new Promise(() => {})); // Never resolves

        store.dispatch(login(credentials));

        const state = store.getState().auth;
        expect(state.loading).toBe(true);
      });
    });

    describe('logout', () => {
      it('should handle successful logout', async () => {
        // First login
        store.dispatch(authSlice.actions.setUser(mockUser));
        store.dispatch(authSlice.actions.setToken('test-token'));
        localStorage.setItem('auth_token', 'test-token');

        const { authAPI } = require('../../../services/api');
        authAPI.logout.mockResolvedValue({});

        await store.dispatch(logout());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.refreshToken).toBeNull();

        // Check localStorage is cleared
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
      });

      it('should clear local state even if API call fails', async () => {
        // First login
        store.dispatch(authSlice.actions.setUser(mockUser));
        store.dispatch(authSlice.actions.setToken('test-token'));

        const { authAPI } = require('../../../services/api');
        authAPI.logout.mockRejectedValue(new Error('Network error'));

        await store.dispatch(logout());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
      });
    });

    describe('restoreAuth', () => {
      it('should restore auth from localStorage', async () => {
        localStorage.setItem('auth_token', 'stored-token');
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        await store.dispatch(restoreAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('stored-token');
      });

      it('should handle invalid stored data', async () => {
        localStorage.setItem('auth_token', 'stored-token');
        localStorage.setItem('auth_user', 'invalid-json');

        await store.dispatch(restoreAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
      });

      it('should not restore if no token stored', async () => {
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        await store.dispatch(restoreAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe('updateProfile', () => {
      it('should handle successful profile update', async () => {
        // First set user
        store.dispatch(authSlice.actions.setUser(mockUser));

        const updateData = { username: 'newusername' };
        const updatedUser = { ...mockUser, username: 'newusername' };

        const { authAPI } = require('../../../services/api');
        authAPI.updateProfile.mockResolvedValue(updatedUser);

        await store.dispatch(updateProfile(updateData));

        const state = store.getState().auth;
        expect(state.user).toEqual(updatedUser);
        expect(state.error).toBeNull();

        // Check localStorage is updated
        expect(JSON.parse(localStorage.getItem('auth_user') || '{}')).toEqual(
          updatedUser
        );
      });

      it('should handle profile update failure', async () => {
        store.dispatch(authSlice.actions.setUser(mockUser));

        const updateData = { username: 'newusername' };
        const errorMessage = 'Username already taken';

        const { authAPI } = require('../../../services/api');
        authAPI.updateProfile.mockRejectedValue(new Error(errorMessage));

        await store.dispatch(updateProfile(updateData));

        const state = store.getState().auth;
        expect(state.user).toEqual(mockUser); // Should remain unchanged
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      store.dispatch(authSlice.actions.setUser(mockUser));
      store.dispatch(authSlice.actions.setToken('test-token'));
    });

    it('should select authenticated state', () => {
      const state = store.getState();
      expect(authSlice.selectors.selectIsAuthenticated(state)).toBe(true);
    });

    it('should select current user', () => {
      const state = store.getState();
      expect(authSlice.selectors.selectCurrentUser(state)).toEqual(mockUser);
    });

    it('should select auth token', () => {
      const state = store.getState();
      expect(authSlice.selectors.selectAuthToken(state)).toBe('test-token');
    });

    it('should select loading state', () => {
      store.dispatch(authSlice.actions.setLoading(true));
      const state = store.getState();
      expect(authSlice.selectors.selectAuthLoading(state)).toBe(true);
    });

    it('should select error state', () => {
      store.dispatch(authSlice.actions.setError('Test error'));
      const state = store.getState();
      expect(authSlice.selectors.selectAuthError(state)).toBe('Test error');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined user data', () => {
      store.dispatch(authSlice.actions.setUser(null));

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle empty token', () => {
      store.dispatch(authSlice.actions.setToken(''));

      const state = store.getState().auth;
      expect(state.token).toBe('');
    });

    it('should handle multiple rapid login attempts', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };

      const { authAPI } = require('../../../services/api');
      authAPI.login.mockImplementation(() =>
        mockApiResponse(
          { user: mockUser, token: 'token', refreshToken: 'refresh' },
          100
        )
      );

      // Dispatch multiple login attempts
      const promises = [
        store.dispatch(login(credentials)),
        store.dispatch(login(credentials)),
        store.dispatch(login(credentials)),
      ];

      await Promise.all(promises);

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(authAPI.login).toHaveBeenCalledTimes(3);
    });
  });
});
