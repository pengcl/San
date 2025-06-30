/**
 * 三国卡牌游戏 - API客户端
 * 统一的前端API调用接口
 */

import {
  ApiResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserHero,
  HeroListParams,
  HeroSummonRequest,
  HeroSummonResult,
  HeroLevelUpRequest,
  Battle,
  BattleStartRequest,
  BattleAction,
  BattleResult,
  BattleHistoryParams,
  Chapter,
  ArenaOpponent,
  ArenaRanking,
  ArenaRecord,
  Resources,
  Item,
  Shop,
  ShopItem,
  Friend,
  FriendRequest,
  Guild,
  GuildMember,
  GuildSearchParams,
  ChatMessage,
  ChatChannel,
  ChatHistoryParams,
  Quest,
  Achievement,
} from './game-types';

// ========== HTTP客户端配置 ==========

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// ========== 错误处理 ==========

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ========== API客户端类 ==========

export class GameApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private token: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  // ========== 基础HTTP方法 ==========

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        ...this.headers,
        ...options?.headers,
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new ApiError(
          result.error?.code || 'UNKNOWN_ERROR',
          result.error?.message || 'Unknown error occurred',
          response.status,
          result.error?.details
        );
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Request timeout');
      }

      throw new ApiError(
        'NETWORK_ERROR',
        'Network error occurred',
        undefined,
        error
      );
    }
  }

  private get<T>(url: string, options?: RequestOptions) {
    return this.request<T>('GET', url, undefined, options);
  }

  private post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>('POST', url, data, options);
  }

  private put<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>('PUT', url, data, options);
  }

  private delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>('DELETE', url, undefined, options);
  }

  // ========== 认证相关 ==========

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/api/auth/register', data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/api/auth/login', data);
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.post<{ message: string }>('/api/auth/logout');
    this.clearToken();
    return response;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/api/auth/refresh', { refreshToken });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>('/api/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<User>('/api/auth/profile', data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/api/auth/change-password', data);
  }

  // ========== 武将相关 ==========

  async getHeroes(params?: HeroListParams): Promise<ApiResponse<{ heroes: UserHero[] }>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<{ heroes: UserHero[] }>(`/api/heroes${queryString}`);
  }

  async getHero(heroId: number): Promise<ApiResponse<UserHero>> {
    return this.get<UserHero>(`/api/heroes/${heroId}`);
  }

  async levelUpHero(heroId: number, data: HeroLevelUpRequest): Promise<ApiResponse<any>> {
    return this.post(`/api/heroes/${heroId}/level-up`, data);
  }

  async starUpHero(heroId: number, data: any): Promise<ApiResponse<any>> {
    return this.post(`/api/heroes/${heroId}/star-up`, data);
  }

  async upgradeHeroSkill(heroId: number, skillId: number, data: any): Promise<ApiResponse<any>> {
    return this.post(`/api/heroes/${heroId}/skills/${skillId}/upgrade`, data);
  }

  async awakenHero(heroId: number, data: any): Promise<ApiResponse<any>> {
    return this.post(`/api/heroes/${heroId}/awaken`, data);
  }

  async equipHero(heroId: number, slot: string, equipmentId: number): Promise<ApiResponse<any>> {
    return this.post(`/api/heroes/${heroId}/equipment/${slot}/equip`, { equipmentId });
  }

  async unequipHero(heroId: number, slot: string): Promise<ApiResponse<any>> {
    return this.delete(`/api/heroes/${heroId}/equipment/${slot}`);
  }

  async summonHeroes(data: HeroSummonRequest): Promise<ApiResponse<{ results: HeroSummonResult[] }>> {
    return this.post<{ results: HeroSummonResult[] }>('/api/heroes/summon', data);
  }

  async combineHeroFragments(data: {
    heroId: number;
    fragmentsToUse: number;
    gold: number;
  }): Promise<ApiResponse<any>> {
    return this.post('/api/heroes/fragments/combine', data);
  }

  async getHeroLibrary(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/api/heroes/library${queryString}`);
  }

  // ========== 战斗相关 ==========

  async getStages(params?: any): Promise<ApiResponse<{ chapters: Chapter[] }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get<{ chapters: Chapter[] }>(`/api/battles/stages${queryString}`);
  }

  async startBattle(data: BattleStartRequest): Promise<ApiResponse<Battle>> {
    return this.post<Battle>('/api/battles/start', data);
  }

  async executeBattleAction(battleId: string, action: BattleAction): Promise<ApiResponse<any>> {
    return this.post(`/api/battles/${battleId}/action`, action);
  }

  async enableAutoBattle(battleId: string, data: any): Promise<ApiResponse<any>> {
    return this.post(`/api/battles/${battleId}/auto`, data);
  }

  async getBattleResult(battleId: string): Promise<ApiResponse<BattleResult>> {
    return this.get<BattleResult>(`/api/battles/${battleId}/result`);
  }

  async surrenderBattle(battleId: string): Promise<ApiResponse<any>> {
    return this.post(`/api/battles/${battleId}/surrender`);
  }

  async getBattleHistory(params?: BattleHistoryParams): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get(`/api/battles/history${queryString}`);
  }

  // ========== 竞技场相关 ==========

  async getArenaRankings(params?: any): Promise<ApiResponse<{
    playerRank: ArenaRecord;
    rankings: ArenaRanking[];
  }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/api/battles/arena/rankings${queryString}`);
  }

  async getArenaOpponents(): Promise<ApiResponse<{ opponents: ArenaOpponent[] }>> {
    return this.get<{ opponents: ArenaOpponent[] }>('/api/battles/arena/opponents');
  }

  async refreshArenaOpponents(data?: { useGems?: boolean }): Promise<ApiResponse<any>> {
    return this.post('/api/battles/arena/refresh', data);
  }

  async getWorldBoss(): Promise<ApiResponse<any>> {
    return this.get('/api/battles/world-boss');
  }

  // ========== 资源相关 ==========

  async getResources(): Promise<ApiResponse<Resources & { items: Item[] }>> {
    return this.get<Resources & { items: Item[] }>('/api/resources');
  }

  async purchaseEnergy(data: { quantity: number; useGems?: boolean }): Promise<ApiResponse<any>> {
    return this.post('/api/resources/energy/purchase', data);
  }

  async getItems(params?: any): Promise<ApiResponse<{ items: Item[] }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get<{ items: Item[] }>(`/api/resources/items${queryString}`);
  }

  async useItem(itemId: number, data: any): Promise<ApiResponse<any>> {
    return this.post(`/api/resources/items/${itemId}/use`, data);
  }

  async sellItem(itemId: number, data: { quantity: number; confirm: boolean }): Promise<ApiResponse<any>> {
    return this.post(`/api/resources/items/${itemId}/sell`, data);
  }

  async expandStorage(data: { slots: number }): Promise<ApiResponse<any>> {
    return this.post('/api/resources/storage/expand', data);
  }

  async getShop(shopType: string): Promise<ApiResponse<Shop>> {
    return this.get<Shop>(`/api/resources/shop?shopType=${shopType}`);
  }

  async purchaseShopItem(data: {
    shopType: string;
    itemId: number;
    quantity?: number;
  }): Promise<ApiResponse<any>> {
    return this.post('/api/resources/shop/purchase', data);
  }

  async refreshShop(data: { shopType: string; useGems?: boolean }): Promise<ApiResponse<any>> {
    return this.post('/api/resources/shop/refresh', data);
  }

  async getTransactions(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/api/resources/transactions${queryString}`);
  }

  async dailyLogin(): Promise<ApiResponse<any>> {
    return this.post('/api/resources/daily-login');
  }

  // ========== 社交相关 ==========

  async getFriends(params?: any): Promise<ApiResponse<{ friends: Friend[] }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get<{ friends: Friend[] }>(`/api/social/friends${queryString}`);
  }

  async addFriend(data: { targetUser: string; message?: string }): Promise<ApiResponse<any>> {
    return this.post('/api/social/friends/add', data);
  }

  async getFriendRequests(): Promise<ApiResponse<{
    receivedRequests: FriendRequest[];
    sentRequests: any[];
  }>> {
    return this.get('/api/social/friends/requests');
  }

  async respondToFriendRequest(requestId: number, action: 'accept' | 'reject'): Promise<ApiResponse<any>> {
    return this.post(`/api/social/friends/requests/${requestId}/respond`, { action });
  }

  async removeFriend(userId: number): Promise<ApiResponse<any>> {
    return this.delete(`/api/social/friends/${userId}`);
  }

  async interactWithFriend(userId: number, interactionType: string): Promise<ApiResponse<any>> {
    return this.post(`/api/social/friends/${userId}/interact`, { interactionType });
  }

  async searchGuilds(params?: GuildSearchParams): Promise<ApiResponse<{ guilds: Guild[] }>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<{ guilds: Guild[] }>(`/api/social/guilds${queryString}`);
  }

  async getGuild(): Promise<ApiResponse<Guild & { playerRole: string }>> {
    return this.get('/api/social/guild');
  }

  async getGuildMembers(params?: any): Promise<ApiResponse<{ members: GuildMember[] }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/api/social/guild/members${queryString}`);
  }

  async joinGuild(data: { guildId: number; message?: string }): Promise<ApiResponse<any>> {
    return this.post('/api/social/guild/join', data);
  }

  async leaveGuild(): Promise<ApiResponse<any>> {
    return this.post('/api/social/guild/leave', { confirm: true });
  }

  async donateToGuild(data: {
    donationType: 'gold' | 'gems' | 'materials';
    amount: number;
  }): Promise<ApiResponse<any>> {
    return this.post('/api/social/guild/donate', data);
  }

  async getChatChannels(): Promise<ApiResponse<{ channels: ChatChannel[] }>> {
    return this.get('/api/social/chat/channels');
  }

  async getChatMessages(channelId: string, params?: ChatHistoryParams): Promise<ApiResponse<{
    messages: ChatMessage[];
  }>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get(`/api/social/chat/${channelId}/messages${queryString}`);
  }

  async sendChatMessage(channelId: string, data: {
    content: string;
    messageType?: string;
  }): Promise<ApiResponse<{ message: ChatMessage }>> {
    return this.post(`/api/social/chat/${channelId}/send`, data);
  }

  // ========== 任务和成就 ==========

  async getDailyQuests(): Promise<ApiResponse<{ quests: Quest[] }>> {
    return this.get('/api/quests/daily');
  }

  async getWeeklyQuests(): Promise<ApiResponse<{ quests: Quest[] }>> {
    return this.get('/api/quests/weekly');
  }

  async claimQuestReward(questId: string): Promise<ApiResponse<any>> {
    return this.post(`/api/quests/${questId}/claim`);
  }

  async getAchievements(params?: any): Promise<ApiResponse<{ achievements: Achievement[] }>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/api/achievements${queryString}`);
  }

  async claimAchievementReward(achievementId: string): Promise<ApiResponse<any>> {
    return this.post(`/api/achievements/${achievementId}/claim`);
  }
}

// ========== 创建客户端实例 ==========

export function createApiClient(config: ApiClientConfig): GameApiClient {
  return new GameApiClient(config);
}

// ========== 默认导出 ==========

export default GameApiClient;