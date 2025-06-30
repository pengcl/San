import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Battle,
  BattleResult,
  Formation,
  BattleAction,
} from '../../types';
import { GameApi } from '../../services/gameApi';

interface BattleState {
  // 当前战斗状态
  currentBattle: Battle | null;
  battleId: string | null;

  // 战斗历史
  battleHistory: BattleResult[];
  recentBattles: BattleResult[];

  // 战斗控制状态
  isInBattle: boolean;
  isPaused: boolean;
  battleSpeed: number;
  autoPlay: boolean;

  // 回合和时间
  currentTurn: number;
  maxTurns: number;
  battleTimer: number;
  turnTimer: number;
  isPlayerTurn: boolean;

  // 选择状态
  selectedHeroId: number | null;
  selectedSkillId: number | null;
  targetHeroId: number | null;

  // 战斗数据
  playerFormation: Formation | null;
  enemyFormation: Formation | null;
  battleActions: BattleAction[];
  battleLog: string[];

  // 动画系统
  animations: {
    activeAnimations: string[];
    animationQueue: any[];
  };

  // 战斗结果
  battleResult: BattleResult | null;
  rewards: any[];

  // PVP相关
  leaderboard: any[];
  currentRank: number | null;
  currentRating: number | null;

  // 加载状态
  isStartingBattle: boolean;
  isEndingBattle: boolean;
  isLoadingHistory: boolean;
  isLoadingLeaderboard: boolean;

  // 错误状态
  error: string | null;

  // 缓存
  lastHistoryUpdate: number | null;
  lastLeaderboardUpdate: number | null;
}

const initialState: BattleState = {
  currentBattle: null,
  battleId: null,
  battleHistory: [],
  recentBattles: [],
  isInBattle: false,
  isPaused: false,
  battleSpeed: 1,
  autoPlay: false,
  currentTurn: 0,
  maxTurns: 50,
  battleTimer: 0,
  turnTimer: 0,
  isPlayerTurn: true,
  selectedHeroId: null,
  selectedSkillId: null,
  targetHeroId: null,
  playerFormation: null,
  enemyFormation: null,
  battleActions: [],
  battleLog: [],
  animations: {
    activeAnimations: [],
    animationQueue: [],
  },
  battleResult: null,
  rewards: [],
  leaderboard: [],
  currentRank: null,
  currentRating: null,
  isStartingBattle: false,
  isEndingBattle: false,
  isLoadingHistory: false,
  isLoadingLeaderboard: false,
  error: null,
  lastHistoryUpdate: null,
  lastLeaderboardUpdate: null,
};

// 异步Thunk actions
export const startBattle = createAsyncThunk(
  'battle/start',
  async (
    params: {
      stageId: number;
      formationId: number;
      battleType: 'campaign' | 'arena' | 'guild';
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await GameApi.Battle.startBattle(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start battle');
    }
  }
);

export const endBattle = createAsyncThunk(
  'battle/end',
  async (
    params: {
      battleId: string;
      battleResult: {
        victory: boolean;
        actions: any[];
        duration: number;
      };
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const result = await GameApi.Battle.endBattle(
        params.battleId,
        params.battleResult
      );
      // 战斗结束后刷新相关数据
      dispatch(fetchBattleHistory({ page: 1, limit: 10 }));
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to end battle');
    }
  }
);

export const fetchBattleHistory = createAsyncThunk(
  'battle/fetchHistory',
  async (
    params: {
      page?: number;
      limit?: number;
      battleType?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const result = await GameApi.Battle.getBattleHistory(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch battle history');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'battle/fetchLeaderboard',
  async (season: string = '', { rejectWithValue }) => {
    try {
      const result = await GameApi.Battle.getLeaderboard(season);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch leaderboard');
    }
  }
);

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    // 战斗状态控制
    setBattleData: (
      state,
      action: PayloadAction<{
        battleId: string;
        playerFormation: Formation;
        enemyFormation: Formation;
        battle?: Battle;
      }>
    ) => {
      state.battleId = action.payload.battleId;
      state.playerFormation = action.payload.playerFormation;
      state.enemyFormation = action.payload.enemyFormation;
      state.currentBattle = action.payload.battle || null;
      state.isInBattle = true;
      state.isPaused = false;
      state.currentTurn = 1;
      state.isPlayerTurn = true;
      state.battleTimer = 0;
      state.turnTimer = 0;
      state.battleActions = [];
      state.battleLog = [];
      state.battleResult = null;
      state.selectedHeroId = null;
      state.selectedSkillId = null;
      state.targetHeroId = null;
      state.animations.activeAnimations = [];
      state.animations.animationQueue = [];
      state.error = null;
    },

    forfeitBattle: state => {
      state.isInBattle = false;
      state.isPaused = false;
      state.currentBattle = null;
      state.battleId = null;
      state.playerFormation = null;
      state.enemyFormation = null;
      state.battleActions = [];
      state.battleLog = [];
      state.selectedHeroId = null;
      state.selectedSkillId = null;
      state.targetHeroId = null;
      state.animations.activeAnimations = [];
      state.animations.animationQueue = [];
    },

    pauseBattle: state => {
      if (state.isInBattle) {
        state.isPaused = true;
      }
    },

    resumeBattle: state => {
      if (state.isInBattle) {
        state.isPaused = false;
      }
    },

    // 战斗设置
    setBattleSpeed: (state, action: PayloadAction<number>) => {
      state.battleSpeed = Math.max(0.25, Math.min(4, action.payload));
    },

    toggleAutoPlay: state => {
      state.autoPlay = !state.autoPlay;
    },

    setAutoPlay: (state, action: PayloadAction<boolean>) => {
      state.autoPlay = action.payload;
    },

    // 回合系统
    nextTurn: state => {
      if (state.isInBattle && !state.isPaused) {
        state.currentTurn = Math.min(state.currentTurn + 1, state.maxTurns);
        state.isPlayerTurn = !state.isPlayerTurn;
        state.turnTimer = 0;
        state.selectedHeroId = null;
        state.selectedSkillId = null;
        state.targetHeroId = null;
      }
    },

    setPlayerTurn: (state, action: PayloadAction<boolean>) => {
      state.isPlayerTurn = action.payload;
    },

    updateBattleTimer: (state, action: PayloadAction<number>) => {
      state.battleTimer = action.payload;
    },

    updateTurnTimer: (state, action: PayloadAction<number>) => {
      state.turnTimer = action.payload;
    },

    setMaxTurns: (state, action: PayloadAction<number>) => {
      state.maxTurns = action.payload;
    },

    // 选择状态管理
    selectHero: (state, action: PayloadAction<number | null>) => {
      state.selectedHeroId = action.payload;
      state.selectedSkillId = null;
      state.targetHeroId = null;
    },

    selectSkill: (state, action: PayloadAction<number | null>) => {
      state.selectedSkillId = action.payload;
      state.targetHeroId = null;
    },

    selectTarget: (state, action: PayloadAction<number | null>) => {
      state.targetHeroId = action.payload;
    },

    clearSelection: state => {
      state.selectedHeroId = null;
      state.selectedSkillId = null;
      state.targetHeroId = null;
    },

    // 战斗动作
    addBattleAction: (state, action: PayloadAction<BattleAction>) => {
      state.battleActions.push(action.payload);

      // 保持最近1000个动作
      if (state.battleActions.length > 1000) {
        state.battleActions = state.battleActions.slice(-1000);
      }
    },

    setBattleActions: (state, action: PayloadAction<BattleAction[]>) => {
      state.battleActions = action.payload;
    },

    clearBattleActions: state => {
      state.battleActions = [];
    },

    // 战斗日志
    addToBattleLog: (state, action: PayloadAction<string>) => {
      state.battleLog.push(`[${state.currentTurn}] ${action.payload}`);

      // 保持最近200条日志
      if (state.battleLog.length > 200) {
        state.battleLog = state.battleLog.slice(-200);
      }
    },

    setBattleLog: (state, action: PayloadAction<string[]>) => {
      state.battleLog = action.payload;
    },

    clearBattleLog: state => {
      state.battleLog = [];
    },

    // 动画管理
    addAnimation: (state, action: PayloadAction<string>) => {
      state.animations.activeAnimations.push(action.payload);
    },

    removeAnimation: (state, action: PayloadAction<string>) => {
      state.animations.activeAnimations =
        state.animations.activeAnimations.filter(
          anim => anim !== action.payload
        );
    },

    queueAnimation: (state, action: PayloadAction<any>) => {
      state.animations.animationQueue.push(action.payload);
    },

    processAnimationQueue: state => {
      if (state.animations.animationQueue.length > 0) {
        const nextAnimation = state.animations.animationQueue.shift();
        if (nextAnimation) {
          state.animations.activeAnimations.push(nextAnimation.id);
        }
      }
    },

    clearAnimations: state => {
      state.animations.activeAnimations = [];
      state.animations.animationQueue = [];
    },

    // 阵容更新
    updatePlayerFormation: (
      state,
      action: PayloadAction<Partial<Formation>>
    ) => {
      if (state.playerFormation) {
        state.playerFormation = { ...state.playerFormation, ...action.payload };
      }
    },

    updateEnemyFormation: (
      state,
      action: PayloadAction<Partial<Formation>>
    ) => {
      if (state.enemyFormation) {
        state.enemyFormation = { ...state.enemyFormation, ...action.payload };
      }
    },

    // 奖励设置
    setRewards: (state, action: PayloadAction<any[]>) => {
      state.rewards = action.payload;
    },

    addReward: (state, action: PayloadAction<any>) => {
      state.rewards.push(action.payload);
    },

    clearRewards: state => {
      state.rewards = [];
    },

    // PVP相关
    updateRanking: (
      state,
      action: PayloadAction<{ rank: number; rating: number }>
    ) => {
      state.currentRank = action.payload.rank;
      state.currentRating = action.payload.rating;
    },

    // 历史记录
    addToBattleHistory: (state, action: PayloadAction<BattleResult>) => {
      state.recentBattles.unshift(action.payload);
      if (state.recentBattles.length > 20) {
        state.recentBattles = state.recentBattles.slice(0, 20);
      }
    },

    // 清除错误
    clearError: state => {
      state.error = null;
    },

    // 重置状态
    resetBattleState: () => initialState,
  },

  extraReducers: builder => {
    // 开始战斗
    builder
      .addCase(startBattle.pending, state => {
        state.isStartingBattle = true;
        state.error = null;
      })
      .addCase(startBattle.fulfilled, (state, action) => {
        state.isStartingBattle = false;
        state.battleId = action.payload.battleId;
        // 这里可以设置其他战斗数据
      })
      .addCase(startBattle.rejected, (state, action) => {
        state.isStartingBattle = false;
        state.error = action.payload as string;
      });

    // 结束战斗
    builder
      .addCase(endBattle.pending, state => {
        state.isEndingBattle = true;
      })
      .addCase(endBattle.fulfilled, (state, action) => {
        state.isEndingBattle = false;
        state.battleResult = action.payload;
        state.isInBattle = false;
        state.battleId = null;

        // 添加到历史记录
        state.recentBattles.unshift(action.payload);
        if (state.recentBattles.length > 20) {
          state.recentBattles = state.recentBattles.slice(0, 20);
        }
      })
      .addCase(endBattle.rejected, (state, action) => {
        state.isEndingBattle = false;
        state.error = action.payload as string;
      });

    // 获取战斗历史
    builder
      .addCase(fetchBattleHistory.pending, state => {
        state.isLoadingHistory = true;
      })
      .addCase(fetchBattleHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.battleHistory = action.payload.battles;
        state.lastHistoryUpdate = Date.now();
      })
      .addCase(fetchBattleHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload as string;
      });

    // 获取排行榜
    builder
      .addCase(fetchLeaderboard.pending, state => {
        state.isLoadingLeaderboard = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.leaderboard = action.payload.rankings;
        state.currentRank = action.payload.myRank || null;
        state.currentRating = action.payload.myRating || null;
        state.lastLeaderboardUpdate = Date.now();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setBattleData,
  forfeitBattle,
  pauseBattle,
  resumeBattle,
  setBattleSpeed,
  toggleAutoPlay,
  setAutoPlay,
  nextTurn,
  setPlayerTurn,
  updateBattleTimer,
  updateTurnTimer,
  setMaxTurns,
  selectHero,
  selectSkill,
  selectTarget,
  clearSelection,
  addBattleAction,
  setBattleActions,
  clearBattleActions,
  addToBattleLog,
  setBattleLog,
  clearBattleLog,
  addAnimation,
  removeAnimation,
  queueAnimation,
  processAnimationQueue,
  clearAnimations,
  updatePlayerFormation,
  updateEnemyFormation,
  setRewards,
  addReward,
  clearRewards,
  updateRanking,
  addToBattleHistory,
  clearError,
  resetBattleState,
} = battleSlice.actions;

// 选择器
export const selectCurrentBattle = (state: { battle: BattleState }) =>
  state.battle.currentBattle;
export const selectBattleId = (state: { battle: BattleState }) =>
  state.battle.battleId;
export const selectIsInBattle = (state: { battle: BattleState }) =>
  state.battle.isInBattle;
export const selectBattlePaused = (state: { battle: BattleState }) =>
  state.battle.isPaused;
export const selectBattleSpeed = (state: { battle: BattleState }) =>
  state.battle.battleSpeed;
export const selectAutoPlay = (state: { battle: BattleState }) =>
  state.battle.autoPlay;

export const selectBattleTiming = (state: { battle: BattleState }) => ({
  currentTurn: state.battle.currentTurn,
  maxTurns: state.battle.maxTurns,
  battleTimer: state.battle.battleTimer,
  turnTimer: state.battle.turnTimer,
  isPlayerTurn: state.battle.isPlayerTurn,
});

export const selectBattleSelection = (state: { battle: BattleState }) => ({
  selectedHeroId: state.battle.selectedHeroId,
  selectedSkillId: state.battle.selectedSkillId,
  targetHeroId: state.battle.targetHeroId,
});

export const selectBattleFormations = (state: { battle: BattleState }) => ({
  player: state.battle.playerFormation,
  enemy: state.battle.enemyFormation,
});

export const selectBattleActions = (state: { battle: BattleState }) =>
  state.battle.battleActions;
export const selectBattleLog = (state: { battle: BattleState }) =>
  state.battle.battleLog;
export const selectBattleAnimations = (state: { battle: BattleState }) =>
  state.battle.animations;
export const selectActiveAnimations = (state: { battle: BattleState }) =>
  state.battle.animations.activeAnimations;
export const selectAnimationQueue = (state: { battle: BattleState }) =>
  state.battle.animations.animationQueue;

export const selectBattleResult = (state: { battle: BattleState }) =>
  state.battle.battleResult;
export const selectBattleRewards = (state: { battle: BattleState }) =>
  state.battle.rewards;

export const selectBattleHistory = (state: { battle: BattleState }) =>
  state.battle.battleHistory;
export const selectRecentBattles = (state: { battle: BattleState }) =>
  state.battle.recentBattles;

export const selectLeaderboard = (state: { battle: BattleState }) =>
  state.battle.leaderboard;
export const selectCurrentRanking = (state: { battle: BattleState }) => ({
  rank: state.battle.currentRank,
  rating: state.battle.currentRating,
});

export const selectBattleLoading = (state: { battle: BattleState }) => ({
  starting: state.battle.isStartingBattle,
  ending: state.battle.isEndingBattle,
  history: state.battle.isLoadingHistory,
  leaderboard: state.battle.isLoadingLeaderboard,
});

export const selectBattleError = (state: { battle: BattleState }) =>
  state.battle.error;

// 复合选择器
export const selectBattleState = (state: { battle: BattleState }) => ({
  isInBattle: state.battle.isInBattle,
  isPaused: state.battle.isPaused,
  currentTurn: state.battle.currentTurn,
  isPlayerTurn: state.battle.isPlayerTurn,
  battleSpeed: state.battle.battleSpeed,
  autoPlay: state.battle.autoPlay,
});

export const selectCanAct = (state: { battle: BattleState }) =>
  state.battle.isInBattle &&
  !state.battle.isPaused &&
  state.battle.isPlayerTurn &&
  state.battle.animations.activeAnimations.length === 0;

export default battleSlice.reducer;
