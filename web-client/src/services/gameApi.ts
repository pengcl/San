import { ApiService, withRetry, withCache } from './api';
import type {
  Hero,
  Item,
  User,
  BattleResult,
  Formation,
  GameStats,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types';

// 认证相关API
export class AuthApi {
  private static readonly BASE_PATH = '/auth';

  // 用户登录
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return withRetry(() =>
      ApiService.post<LoginResponse>(`${this.BASE_PATH}/login`, credentials)
    );
  }

  // 用户注册
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return ApiService.post<RegisterResponse>(
      `${this.BASE_PATH}/register`,
      userData
    );
  }

  // 刷新Token
  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    return ApiService.post(`${this.BASE_PATH}/refresh`, { refreshToken });
  }

  // 登出
  static async logout(): Promise<void> {
    return ApiService.post(`${this.BASE_PATH}/logout`);
  }

  // 验证Token
  static async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    return ApiService.get(`${this.BASE_PATH}/verify`);
  }

  // 忘记密码
  static async forgotPassword(email: string): Promise<{ message: string }> {
    return ApiService.post(`${this.BASE_PATH}/forgot-password`, { email });
  }

  // 重置密码
  static async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    return ApiService.post(`${this.BASE_PATH}/reset-password`, {
      token,
      password,
    });
  }
}

// 用户相关API
export class UserApi {
  private static readonly BASE_PATH = '/users';

  // 获取用户信息
  static async getProfile(): Promise<User> {
    return withCache(
      'user-profile',
      () => ApiService.get<User>(`${this.BASE_PATH}/profile`),
      2 * 60 * 1000 // 2分钟缓存
    );
  }

  // 更新用户信息
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return ApiService.patch<User>(`${this.BASE_PATH}/profile`, userData);
  }

  // 上传头像
  static async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ avatarUrl: string }> {
    return ApiService.upload(`${this.BASE_PATH}/avatar`, file, onProgress);
  }

  // 获取游戏统计
  static async getGameStats(): Promise<GameStats> {
    return withCache(
      'game-stats',
      () => ApiService.get<GameStats>(`${this.BASE_PATH}/stats`),
      5 * 60 * 1000 // 5分钟缓存
    );
  }

  // 每日签到
  static async dailyCheckIn(): Promise<{
    rewards: Item[];
    consecutiveDays: number;
    nextReward: Item;
  }> {
    return ApiService.post(`${this.BASE_PATH}/daily-checkin`);
  }
}

// 武将相关API
export class HeroApi {
  private static readonly BASE_PATH = '/heroes';

  // 获取武将列表
  static async getHeroes(params?: {
    page?: number;
    limit?: number;
    rarity?: number;
    faction?: string;
    search?: string;
  }): Promise<{
    heroes: Hero[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryString = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : '';

    return withCache(
      `heroes-list-${queryString}`,
      () => ApiService.get(`${this.BASE_PATH}${queryString}`),
      60 * 1000 // 1分钟缓存
    );
  }

  // 获取武将详情
  static async getHero(heroId: number): Promise<Hero> {
    return withCache(
      `hero-${heroId}`,
      () => ApiService.get<Hero>(`${this.BASE_PATH}/${heroId}`),
      2 * 60 * 1000 // 2分钟缓存
    );
  }

  // 升级武将
  static async upgradeHero(
    heroId: number,
    materials: { itemId: number; quantity: number }[]
  ): Promise<{
    hero: Hero;
    usedMaterials: Item[];
    newLevel: number;
  }> {
    return ApiService.post(`${this.BASE_PATH}/${heroId}/upgrade`, {
      materials,
    });
  }

  // 武将突破
  static async promoteHero(
    heroId: number,
    promotionMaterials: { itemId: number; quantity: number }[]
  ): Promise<{
    hero: Hero;
    newRarity: number;
    usedMaterials: Item[];
  }> {
    return ApiService.post(`${this.BASE_PATH}/${heroId}/promote`, {
      promotionMaterials,
    });
  }

  // 学习技能
  static async learnSkill(heroId: number, skillId: number): Promise<Hero> {
    return ApiService.post(`${this.BASE_PATH}/${heroId}/skills/${skillId}`);
  }

  // 装备物品
  static async equipItem(
    heroId: number,
    itemId: number,
    slot: string
  ): Promise<Hero> {
    return ApiService.post(`${this.BASE_PATH}/${heroId}/equip`, {
      itemId,
      slot,
    });
  }

  // 卸下装备
  static async unequipItem(heroId: number, slot: string): Promise<Hero> {
    return ApiService.delete(`${this.BASE_PATH}/${heroId}/equip/${slot}`);
  }

  // 召唤武将
  static async summonHeroes(
    summonType: 'normal' | 'premium',
    count: number
  ): Promise<{
    heroes: Hero[];
    cost: { itemId: number; quantity: number }[];
    isGuaranteed: boolean;
  }> {
    return ApiService.post(`${this.BASE_PATH}/summon`, { summonType, count });
  }
}

// 物品/背包相关API
export class InventoryApi {
  private static readonly BASE_PATH = '/inventory';

  // 获取背包物品
  static async getItems(params?: {
    category?: string;
    type?: string;
    rarity?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryString = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : '';

    return ApiService.get(`${this.BASE_PATH}${queryString}`);
  }

  // 使用物品
  static async useItem(
    itemId: number,
    quantity: number = 1,
    targetId?: number
  ): Promise<{
    result: any;
    remainingQuantity: number;
    rewards?: Item[];
  }> {
    return ApiService.post(`${this.BASE_PATH}/use`, {
      itemId,
      quantity,
      targetId,
    });
  }

  // 出售物品
  static async sellItems(
    items: { itemId: number; quantity: number }[]
  ): Promise<{
    totalValue: number;
    soldItems: Item[];
  }> {
    return ApiService.post(`${this.BASE_PATH}/sell`, { items });
  }

  // 合成物品
  static async craftItem(
    recipeId: number,
    quantity: number = 1
  ): Promise<{
    craftedItems: Item[];
    usedMaterials: Item[];
  }> {
    return ApiService.post(`${this.BASE_PATH}/craft`, { recipeId, quantity });
  }
}

// 阵容相关API
export class FormationApi {
  private static readonly BASE_PATH = '/formations';

  // 获取阵容列表
  static async getFormations(): Promise<Formation[]> {
    return withCache(
      'formations',
      () => ApiService.get<Formation[]>(this.BASE_PATH),
      30 * 1000 // 30秒缓存
    );
  }

  // 获取指定阵容
  static async getFormation(formationId: number): Promise<Formation> {
    return ApiService.get<Formation>(`${this.BASE_PATH}/${formationId}`);
  }

  // 保存阵容
  static async saveFormation(
    formationId: number,
    formation: {
      name?: string;
      slots: { position: number; heroId: number | null }[];
    }
  ): Promise<Formation> {
    return ApiService.put(`${this.BASE_PATH}/${formationId}`, formation);
  }

  // 创建新阵容
  static async createFormation(formation: {
    name: string;
    slots: { position: number; heroId: number | null }[];
  }): Promise<Formation> {
    return ApiService.post(this.BASE_PATH, formation);
  }

  // 删除阵容
  static async deleteFormation(formationId: number): Promise<void> {
    return ApiService.delete(`${this.BASE_PATH}/${formationId}`);
  }

  // 设置当前使用的阵容
  static async setActiveFormation(formationId: number): Promise<void> {
    return ApiService.post(`${this.BASE_PATH}/${formationId}/activate`);
  }
}

// 战斗相关API
export class BattleApi {
  private static readonly BASE_PATH = '/battles';

  // 获取战斗关卡
  static async getStages(params?: {
    chapter?: number;
    difficulty?: 'normal' | 'elite' | 'heroic';
    completed?: boolean;
  }): Promise<any> {
    const queryString = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : '';

    return withCache(
      `battle-stages${queryString}`,
      () => ApiService.get(`${this.BASE_PATH}/stages${queryString}`),
      60 * 1000 // 1分钟缓存
    );
  }

  // 开始战斗
  static async startBattle(params: {
    battleType: 'pve_normal' | 'pve_elite' | 'pvp_arena' | 'guild_war' | 'world_boss';
    stageId?: string;
    opponentId?: number;
    formation: Array<{
      position: number;
      heroId: number | null;
    }>;
    autoSkill?: boolean;
  }): Promise<{
    battleId: string;
    battleType: string;
    playerTeam: any;
    enemyTeam: any;
    battleState: any;
    nextActions: any[];
  }> {
    return ApiService.post(`${this.BASE_PATH}/start`, params);
  }

  // 执行战斗动作
  static async executeAction(
    battleId: string,
    action: {
      heroId: number;
      actionType: 'attack' | 'skill' | 'ultimate' | 'defend';
      skillId?: number;
      targetId?: number;
      targetPosition?: number;
    }
  ): Promise<any> {
    return ApiService.post(`${this.BASE_PATH}/${battleId}/action`, action);
  }

  // 获取战斗结果
  static async getBattleResult(battleId: string): Promise<BattleResult> {
    return ApiService.get(`${this.BASE_PATH}/${battleId}/result`);
  }

  // 自动战斗
  static async autoBattle(battleId: string): Promise<any> {
    return ApiService.post(`${this.BASE_PATH}/${battleId}/auto`);
  }

  // 获取战斗历史
  static async getBattleHistory(params?: {
    page?: number;
    limit?: number;
    battleType?: string;
  }): Promise<{
    battles: BattleResult[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryString = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : '';

    return ApiService.get(`${this.BASE_PATH}/history${queryString}`);
  }

  // 获取PVP排行榜
  static async getLeaderboard(season?: string): Promise<{
    rankings: Array<{
      rank: number;
      user: User;
      rating: number;
      wins: number;
      losses: number;
    }>;
    myRank?: number;
    myRating?: number;
  }> {
    const queryString = season ? `?season=${season}` : '';
    return withCache(
      `leaderboard${queryString}`,
      () => ApiService.get(`${this.BASE_PATH}/leaderboard${queryString}`),
      60 * 1000 // 1分钟缓存
    );
  }
}

// 商城相关API
export class ShopApi {
  private static readonly BASE_PATH = '/shop';

  // 获取商城商品
  static async getShopItems(category?: string): Promise<{
    items: Array<{
      id: number;
      item: Item;
      price: { currency: string; amount: number };
      discount?: number;
      limitPerUser?: number;
      limitTotal?: number;
      purchased: number;
      endDate?: string;
    }>;
  }> {
    const queryString = category ? `?category=${category}` : '';
    return withCache(
      `shop-items${queryString}`,
      () => ApiService.get(`${this.BASE_PATH}/items${queryString}`),
      5 * 60 * 1000 // 5分钟缓存
    );
  }

  // 购买商品
  static async purchaseItem(
    itemId: number,
    quantity: number = 1
  ): Promise<{
    success: boolean;
    purchasedItems: Item[];
    newBalance: { [currency: string]: number };
  }> {
    return ApiService.post(`${this.BASE_PATH}/purchase`, { itemId, quantity });
  }

  // 获取购买历史
  static async getPurchaseHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    purchases: Array<{
      id: number;
      item: Item;
      quantity: number;
      totalPrice: { currency: string; amount: number };
      purchaseDate: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryString = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : '';

    return ApiService.get(`${this.BASE_PATH}/history${queryString}`);
  }
}

// 公会相关API
export class GuildApi {
  private static readonly BASE_PATH = '/guild';

  // 获取公会信息
  static async getGuildInfo(): Promise<{
    guild: any;
    members: any[];
    activities: any[];
  } | null> {
    return withCache(
      'guild-info',
      () => ApiService.get(`${this.BASE_PATH}/info`),
      2 * 60 * 1000 // 2分钟缓存
    );
  }

  // 搜索公会
  static async searchGuilds(query: string): Promise<any[]> {
    return ApiService.get(
      `${this.BASE_PATH}/search?q=${encodeURIComponent(query)}`
    );
  }

  // 申请加入公会
  static async applyToGuild(guildId: number, message?: string): Promise<void> {
    return ApiService.post(`${this.BASE_PATH}/${guildId}/apply`, { message });
  }

  // 离开公会
  static async leaveGuild(): Promise<void> {
    return ApiService.post(`${this.BASE_PATH}/leave`);
  }
}

// 导出所有API
export const GameApi = {
  Auth: AuthApi,
  User: UserApi,
  Hero: HeroApi,
  Inventory: InventoryApi,
  Formation: FormationApi,
  Battle: BattleApi,
  Shop: ShopApi,
  Guild: GuildApi,
};

export default GameApi;
