import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameStats, User, Achievement } from '../../types';
import { GameApi } from '../../services/gameApi';

interface GameState {
  // 游戏统计数据
  stats: GameStats | null;

  // 用户数据
  userProfile: User | null;

  // 成就系统
  achievements: Achievement[];
  unlockedAchievements: number[];

  // 游戏配置
  serverTime: number | null;
  maintenanceMode: boolean;

  // 加载状态
  isLoadingStats: boolean;
  isLoadingProfile: boolean;
  isLoadingAchievements: boolean;

  // 错误状态
  statsError: string | null;
  profileError: string | null;
  achievementsError: string | null;

  // 缓存时间戳
  lastStatsUpdate: number | null;
  lastProfileUpdate: number | null;
  lastAchievementsUpdate: number | null;
}

const initialState: GameState = {
  stats: null,
  userProfile: null,
  achievements: [],
  unlockedAchievements: [],
  serverTime: null,
  maintenanceMode: false,
  isLoadingStats: false,
  isLoadingProfile: false,
  isLoadingAchievements: false,
  statsError: null,
  profileError: null,
  achievementsError: null,
  lastStatsUpdate: null,
  lastProfileUpdate: null,
  lastAchievementsUpdate: null,
};

// 异步Thunk actions
export const fetchGameStats = createAsyncThunk(
  'game/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await GameApi.User.getGameStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch game stats');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'game/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await GameApi.User.getProfile();
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const performDailyCheckIn = createAsyncThunk(
  'game/dailyCheckIn',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await GameApi.User.dailyCheckIn();
      // 签到后刷新用户资料和统计
      dispatch(fetchUserProfile());
      dispatch(fetchGameStats());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Daily check-in failed');
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // 直接更新游戏数据
    updateStats: (state, action: PayloadAction<Partial<GameStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },

    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, ...action.payload };
      }
    },

    // 货币更新
    updateCurrency: (
      state,
      action: PayloadAction<{ gold?: number; gems?: number; energy?: number }>
    ) => {
      const { gold, gems, energy } = action.payload;

      if (state.userProfile) {
        if (gold !== undefined)
          state.userProfile.gold = Math.max(0, state.userProfile.gold + gold);
        if (gems !== undefined)
          state.userProfile.gems = Math.max(0, state.userProfile.gems + gems);
        if (energy !== undefined && state.userProfile.energy !== undefined) {
          state.userProfile.energy = Math.max(
            0,
            state.userProfile.energy + energy
          );
        }
      }

      if (state.stats) {
        if (gold !== undefined)
          state.stats.gold = Math.max(0, state.stats.gold + gold);
        if (gems !== undefined)
          state.stats.gems = Math.max(0, state.stats.gems + gems);
        if (energy !== undefined)
          state.stats.energy = Math.max(0, state.stats.energy + energy);
      }
    },

    // 经验值更新
    updateExperience: (
      state,
      action: PayloadAction<{ experience: number; levelUp?: boolean }>
    ) => {
      const { experience, levelUp } = action.payload;

      if (state.userProfile) {
        state.userProfile.experience += experience;
        if (levelUp) {
          state.userProfile.level += 1;
        }
      }

      if (state.stats) {
        state.stats.experience += experience;
        if (levelUp) {
          state.stats.level += 1;
        }
      }
    },

    // 成就系统
    unlockAchievement: (state, action: PayloadAction<number>) => {
      const achievementId = action.payload;
      if (!state.unlockedAchievements.includes(achievementId)) {
        state.unlockedAchievements.push(achievementId);
      }

      // 更新成就进度
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement) {
        achievement.completed = true;
        achievement.completedAt = new Date().toISOString();
        achievement.progress = achievement.maxProgress;
      }
    },

    updateAchievementProgress: (
      state,
      action: PayloadAction<{ id: number; progress: number }>
    ) => {
      const { id, progress } = action.payload;
      const achievement = state.achievements.find(a => a.id === id);
      if (achievement) {
        achievement.progress = Math.min(progress, achievement.maxProgress);
        if (achievement.progress >= achievement.maxProgress) {
          achievement.completed = true;
          achievement.completedAt = new Date().toISOString();
          if (!state.unlockedAchievements.includes(id)) {
            state.unlockedAchievements.push(id);
          }
        }
      }
    },

    // 服务器时间同步
    updateServerTime: (state, action: PayloadAction<number>) => {
      state.serverTime = action.payload;
    },

    // 维护模式
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.maintenanceMode = action.payload;
    },

    // 清除错误
    clearErrors: state => {
      state.statsError = null;
      state.profileError = null;
      state.achievementsError = null;
    },

    // 重置状态
    resetGameState: () => initialState,
  },

  extraReducers: builder => {
    // 游戏统计
    builder
      .addCase(fetchGameStats.pending, state => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(fetchGameStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload;
        state.lastStatsUpdate = Date.now();
        state.statsError = null;
      })
      .addCase(fetchGameStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsError = action.payload as string;
      });

    // 用户资料
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.userProfile = action.payload;
        state.lastProfileUpdate = Date.now();
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload as string;
      });

    // 每日签到
    builder.addCase(performDailyCheckIn.fulfilled, (_state, action) => {
      // 签到成功后的处理可以在这里添加
      console.log('Daily check-in successful:', action.payload);
    });
  },
});

export const {
  updateStats,
  updateUserProfile,
  updateCurrency,
  updateExperience,
  unlockAchievement,
  updateAchievementProgress,
  updateServerTime,
  setMaintenanceMode,
  clearErrors,
  resetGameState,
} = gameSlice.actions;

// 选择器
export const selectGameStats = (state: { game: GameState }) => state.game.stats;
export const selectUserProfile = (state: { game: GameState }) =>
  state.game.userProfile;
export const selectAchievements = (state: { game: GameState }) =>
  state.game.achievements;
export const selectUnlockedAchievements = (state: { game: GameState }) =>
  state.game.unlockedAchievements;
export const selectServerTime = (state: { game: GameState }) =>
  state.game.serverTime;
export const selectMaintenanceMode = (state: { game: GameState }) =>
  state.game.maintenanceMode;

// 加载状态选择器
export const selectGameLoading = (state: { game: GameState }) => ({
  stats: state.game.isLoadingStats,
  profile: state.game.isLoadingProfile,
  achievements: state.game.isLoadingAchievements,
});

// 错误状态选择器
export const selectGameErrors = (state: { game: GameState }) => ({
  stats: state.game.statsError,
  profile: state.game.profileError,
  achievements: state.game.achievementsError,
});

// 缓存时间选择器
export const selectLastUpdateTimes = (state: { game: GameState }) => ({
  stats: state.game.lastStatsUpdate,
  profile: state.game.lastProfileUpdate,
  achievements: state.game.lastAchievementsUpdate,
});

// 组合选择器
export const selectUserCurrency = (state: { game: GameState }) => ({
  gold: state.game.userProfile?.gold || state.game.stats?.gold || 0,
  gems: state.game.userProfile?.gems || state.game.stats?.gems || 0,
  energy: state.game.userProfile?.energy || state.game.stats?.energy || 0,
});

export const selectUserLevel = (state: { game: GameState }) => ({
  level: state.game.userProfile?.level || state.game.stats?.level || 1,
  experience:
    state.game.userProfile?.experience || state.game.stats?.experience || 0,
  maxExperience: state.game.stats?.maxExperience || 100,
});

export default gameSlice.reducer;
