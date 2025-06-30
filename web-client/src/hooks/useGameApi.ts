import { useCallback } from 'react';
import {
  useApi,
  usePaginatedApi,
  useSearchApi,
  usePollingApi,
  type UseApiOptions,
} from './useApi';
import { GameApi } from '../services/gameApi';
import type { Hero, Item, User, Formation } from '../types';

// 用户相关Hooks
export function useUserProfile(options?: UseApiOptions<User>) {
  return useApi('user-profile', GameApi.User.getProfile, {
    immediate: true,
    ...options,
  });
}

export function useGameStats() {
  return usePollingApi('game-stats', GameApi.User.getGameStats, {
    immediate: true,
    interval: 30000, // 30秒轮询
  });
}

export function useDailyCheckIn() {
  const checkIn = useCallback(async () => {
    return GameApi.User.dailyCheckIn();
  }, []);

  return {
    checkIn,
  };
}

// 武将相关Hooks
export function useHeroes(params?: {
  page?: number;
  limit?: number;
  rarity?: number;
  faction?: string;
}) {
  return usePaginatedApi(
    'heroes',
    async (page, limit) => {
      const result = await GameApi.Hero.getHeroes({ ...params, page, limit });
      return {
        data: result.heroes,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    },
    {
      immediate: true,
      initialPage: params?.page || 1,
      initialLimit: params?.limit || 20,
    }
  );
}

export function useHero(heroId: number, options?: UseApiOptions<Hero>) {
  return useApi(`hero-${heroId}`, () => GameApi.Hero.getHero(heroId), {
    immediate: true,
    ...options,
  });
}

export function useHeroSearch(
  options?: UseApiOptions<{ heroes: Hero[]; total: number }>
) {
  return useSearchApi(
    'hero-search',
    async query => {
      const result = await GameApi.Hero.getHeroes({ search: query, limit: 50 });
      return {
        heroes: result.heroes,
        total: result.total,
      };
    },
    {
      debounceMs: 500,
      minQueryLength: 2,
      ...options,
    }
  );
}

export function useHeroOperations() {
  const upgradeHero = useCallback(
    async (
      heroId: number,
      materials: { itemId: number; quantity: number }[]
    ) => {
      return GameApi.Hero.upgradeHero(heroId, materials);
    },
    []
  );

  const promoteHero = useCallback(
    async (
      heroId: number,
      materials: { itemId: number; quantity: number }[]
    ) => {
      return GameApi.Hero.promoteHero(heroId, materials);
    },
    []
  );

  const learnSkill = useCallback(async (heroId: number, skillId: number) => {
    return GameApi.Hero.learnSkill(heroId, skillId);
  }, []);

  const equipItem = useCallback(
    async (heroId: number, itemId: number, slot: string) => {
      return GameApi.Hero.equipItem(heroId, itemId, slot);
    },
    []
  );

  const unequipItem = useCallback(async (heroId: number, slot: string) => {
    return GameApi.Hero.unequipItem(heroId, slot);
  }, []);

  const summonHeroes = useCallback(
    async (summonType: 'normal' | 'premium', count: number) => {
      return GameApi.Hero.summonHeroes(summonType, count);
    },
    []
  );

  return {
    upgradeHero,
    promoteHero,
    learnSkill,
    equipItem,
    unequipItem,
    summonHeroes,
  };
}

// 背包相关Hooks
export function useInventory(params?: {
  category?: string;
  type?: string;
  rarity?: number;
}) {
  return usePaginatedApi(
    'inventory',
    async (page, limit) => {
      const result = await GameApi.Inventory.getItems({
        ...params,
        page,
        limit,
      });
      return {
        data: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useInventoryOperations() {
  const useItem = useCallback(
    async (itemId: number, quantity: number = 1, targetId?: number) => {
      return GameApi.Inventory.useItem(itemId, quantity, targetId);
    },
    []
  );

  const sellItems = useCallback(
    async (items: { itemId: number; quantity: number }[]) => {
      return GameApi.Inventory.sellItems(items);
    },
    []
  );

  const craftItem = useCallback(
    async (recipeId: number, quantity: number = 1) => {
      return GameApi.Inventory.craftItem(recipeId, quantity);
    },
    []
  );

  return {
    useItem,
    sellItems,
    craftItem,
  };
}

// 阵容相关Hooks
export function useFormations(options?: UseApiOptions<Formation[]>) {
  return useApi('formations', GameApi.Formation.getFormations, {
    immediate: true,
    ...options,
  });
}

export function useFormation(
  formationId: number,
  options?: UseApiOptions<Formation>
) {
  return useApi(
    `formation-${formationId}`,
    () => GameApi.Formation.getFormation(formationId),
    {
      immediate: true,
      ...options,
    }
  );
}

export function useFormationOperations() {
  const saveFormation = useCallback(
    async (
      formationId: number,
      formation: {
        name?: string;
        slots: { position: number; heroId: number | null }[];
      }
    ) => {
      return GameApi.Formation.saveFormation(formationId, formation);
    },
    []
  );

  const createFormation = useCallback(
    async (formation: {
      name: string;
      slots: { position: number; heroId: number | null }[];
    }) => {
      return GameApi.Formation.createFormation(formation);
    },
    []
  );

  const deleteFormation = useCallback(async (formationId: number) => {
    return GameApi.Formation.deleteFormation(formationId);
  }, []);

  const setActiveFormation = useCallback(async (formationId: number) => {
    return GameApi.Formation.setActiveFormation(formationId);
  }, []);

  return {
    saveFormation,
    createFormation,
    deleteFormation,
    setActiveFormation,
  };
}

// 战斗相关Hooks
export function useBattleHistory(params?: {
  page?: number;
  limit?: number;
  battleType?: string;
}) {
  return usePaginatedApi(
    'battle-history',
    async (page, limit) => {
      const result = await GameApi.Battle.getBattleHistory({
        ...params,
        page,
        limit,
      });
      return {
        data: result.battles,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useLeaderboard(season?: string, options?: UseApiOptions<any>) {
  return usePollingApi(
    `leaderboard-${season || 'current'}`,
    () => GameApi.Battle.getLeaderboard(season),
    {
      immediate: true,
      interval: 60000, // 1分钟轮询
      ...options,
    }
  );
}

export function useBattleOperations() {
  const startBattle = useCallback(
    async (params: {
      stageId: number;
      formationId: number;
      battleType: 'campaign' | 'arena' | 'guild';
    }) => {
      return GameApi.Battle.startBattle(params);
    },
    []
  );

  const endBattle = useCallback(
    async (
      battleId: string,
      battleResult: {
        victory: boolean;
        actions: any[];
        duration: number;
      }
    ) => {
      return GameApi.Battle.endBattle(battleId, battleResult);
    },
    []
  );

  return {
    startBattle,
    endBattle,
  };
}

// 商城相关Hooks
export function useShopItems(category?: string, options?: UseApiOptions<any>) {
  return useApi(
    `shop-items-${category || 'all'}`,
    () => GameApi.Shop.getShopItems(category),
    {
      immediate: true,
      ...options,
    }
  );
}

export function usePurchaseHistory(params?: { page?: number; limit?: number }) {
  return usePaginatedApi(
    'purchase-history',
    async (page, limit) => {
      const result = await GameApi.Shop.getPurchaseHistory({
        ...params,
        page,
        limit,
      });
      return {
        data: result.purchases,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    },
    {
      immediate: false, // 按需加载
    }
  );
}

export function useShopOperations() {
  const purchaseItem = useCallback(
    async (itemId: number, quantity: number = 1) => {
      return GameApi.Shop.purchaseItem(itemId, quantity);
    },
    []
  );

  return {
    purchaseItem,
  };
}

// 公会相关Hooks
export function useGuildInfo(options?: UseApiOptions<any>) {
  return usePollingApi('guild-info', GameApi.Guild.getGuildInfo, {
    immediate: true,
    interval: 60000, // 1分钟轮询
    ...options,
  });
}

export function useGuildSearch(options?: UseApiOptions<any[]>) {
  return useSearchApi(
    'guild-search',
    query => GameApi.Guild.searchGuilds(query),
    {
      debounceMs: 500,
      minQueryLength: 2,
      ...options,
    }
  );
}

export function useGuildOperations() {
  const applyToGuild = useCallback(
    async (guildId: number, message?: string) => {
      return GameApi.Guild.applyToGuild(guildId, message);
    },
    []
  );

  const leaveGuild = useCallback(async () => {
    return GameApi.Guild.leaveGuild();
  }, []);

  return {
    applyToGuild,
    leaveGuild,
  };
}

// 认证相关Hooks
export function useAuthOperations() {
  const login = useCallback(
    async (credentials: {
      username: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      return GameApi.Auth.login(credentials);
    },
    []
  );

  const register = useCallback(
    async (userData: { username: string; email: string; password: string }) => {
      return GameApi.Auth.register(userData);
    },
    []
  );

  const logout = useCallback(async () => {
    return GameApi.Auth.logout();
  }, []);

  const refreshToken = useCallback(async (refreshToken: string) => {
    return GameApi.Auth.refreshToken(refreshToken);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return GameApi.Auth.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    return GameApi.Auth.resetPassword(token, password);
  }, []);

  return {
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
  };
}

// 综合的游戏数据Hook，用于加载游戏初始数据
export function useGameInitData(
  options?: UseApiOptions<{
    user: User;
    heroes: Hero[];
    formations: Formation[];
    inventory: Item[];
  }>
) {
  return useApi(
    'game-init-data',
    async () => {
      const [user, heroesResult, formations, inventoryResult] =
        await Promise.all([
          GameApi.User.getProfile(),
          GameApi.Hero.getHeroes({ limit: 100 }),
          GameApi.Formation.getFormations(),
          GameApi.Inventory.getItems({ limit: 100 }),
        ]);

      return {
        user,
        heroes: heroesResult.heroes,
        formations,
        inventory: inventoryResult.items,
      };
    },
    {
      immediate: true,
      ...options,
    }
  );
}
