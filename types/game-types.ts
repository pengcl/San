/**
 * 三国卡牌游戏 - 统一数据类型定义
 * Generated for standardized frontend-backend development
 */

// ========== 基础类型 ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ========== 用户相关 ==========

export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  energyLastUpdate: string;
  vipLevel: number;
  vipExperience: number;
  avatar: string | null;
  createdAt: string;
  lastLogin: string;
  dailyLoginStreak: number;
  totalLoginDays: number;
  settings: UserSettings;
  statistics: UserStatistics;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  language: string;
}

export interface UserStatistics {
  totalBattles: number;
  totalVictories: number;
  winRate: number;
  highestArenaRank: number;
  totalHeroes: number;
  totalPlayTime: number;
}

export interface LoginRequest {
  identifier: string; // 用户名或邮箱
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// ========== 武将相关 ==========

export type FactionType = 'shu' | 'wei' | 'wu' | 'qunxiong' | 'yizu';
export type UnitType = 'infantry' | 'cavalry' | 'archer' | 'strategist';
export type RarityLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface HeroSkill {
  id: number;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  type: string;
  cooldown: number;
  energyCost: number;
  effects: string[];
}

export interface HeroEquipment {
  slot: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory1' | 'accessory2';
  item: Equipment | null;
}

export interface HeroAwakening {
  stage: number;
  isAwakened: boolean;
  nextStageRequirements: any | null;
}

export interface HeroBond {
  name: string;
  description: string;
  requiredHeroes: string[];
  isActive: boolean;
  effects: string[];
}

export interface UserHero {
  id: number;
  heroId: number;
  name: string;
  title: string;
  description: string;
  level: number;
  experience: number;
  maxExperience: number;
  rarity: RarityLevel;
  faction: FactionType;
  unitType: UnitType;
  power: number;
  baseStats: HeroStats;
  currentStats: HeroStats;
  skills: HeroSkill[];
  equipment: HeroEquipment[];
  awakening: HeroAwakening;
  bonds: HeroBond[];
  avatar: string;
  cardImage: string;
  acquiredAt: string;
  lastUsed: string;
}

export interface HeroTemplate {
  id: number;
  name: string;
  title: string;
  description: string;
  faction: FactionType;
  unitType: UnitType;
  baseStats: HeroStats;
  skills: HeroSkill[];
  avatar: string;
  cardImage: string;
  obtainMethods: string[];
  isActive: boolean;
}

export interface HeroSummonRequest {
  summonType: 'normal' | 'premium' | 'faction' | 'event';
  quantity: 1 | 10;
  useTickets?: boolean;
}

export interface HeroSummonResult {
  isNew: boolean;
  hero: UserHero | null;
  fragments: {
    heroId: number;
    quantity: number;
  };
  rarity: RarityLevel;
}

export interface HeroLevelUpRequest {
  useItems?: Array<{
    itemId: number;
    quantity: number;
  }>;
  useGold?: number;
  targetLevel?: number;
}

// ========== 战斗相关 ==========

export type BattleType = 'pve_normal' | 'pve_elite' | 'pve_heroic' | 'pvp_arena' | 'guild_war' | 'world_boss';
export type BattleResult = 'victory' | 'defeat' | 'draw';
export type ActionType = 'attack' | 'skill' | 'ultimate' | 'defend';

export interface Formation {
  position: number; // 1-9
  heroId: number | null;
}

export interface BattleStartRequest {
  battleType: BattleType;
  stageId?: string; // PVE必需
  opponentId?: number; // PVP必需
  formation: Formation[];
  autoSkill?: boolean;
}

export interface BattleHero {
  id: number;
  name: string;
  level: number;
  position: number;
  currentHp: number;
  maxHp: number;
  stats: HeroStats;
  skills: HeroSkill[];
  buffs: any[];
}

export interface BattleTeam {
  heroes: BattleHero[];
}

export interface BattleState {
  turn: number;
  phase: string;
  timeLimit: number;
  playerTeam: BattleTeam;
  enemyTeam: BattleTeam;
  battleEnded: boolean;
  winner: string | null;
}

export interface BattleAction {
  heroId: number;
  actionType: ActionType;
  skillId?: number;
  targetId?: number;
  targetPosition?: number;
}

export interface BattleActionResult {
  success: boolean;
  damage: number;
  healing: number;
  effects: string[];
  criticalHit: boolean;
  dodged: boolean;
  blocked: boolean;
}

export interface Battle {
  battleId: string;
  battleType: BattleType;
  playerTeam: BattleTeam;
  enemyTeam: BattleTeam;
  battleState: BattleState;
  nextActions: Array<{
    heroId: number;
    actionType: string;
    availableTargets: number[];
    availableSkills: HeroSkill[];
  }>;
}

export interface BattleResult {
  battleId: string;
  battleType: BattleType;
  result: BattleResult;
  duration: number;
  turns: number;
  starRating: number;
  experience: {
    player: number;
    heroes: Array<{
      heroId: number;
      expGained: number;
      levelUp: boolean;
      newLevel: number;
    }>;
  };
  rewards: {
    gold: number;
    items: Item[];
    heroFragments: Array<{
      heroId: number;
      fragments: number;
    }>;
  };
  statistics: {
    totalDamageDealt: number;
    totalDamageReceived: number;
    totalHealing: number;
    criticalHits: number;
    skillsUsed: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    reward: any;
  }>;
}

// ========== 关卡相关 ==========

export interface Stage {
  id: string;
  name: string;
  energyCost: number;
  recommendedPower: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  firstClearReward: any;
  dropItems: Item[];
  enemies: Array<{
    name: string;
    level: number;
    avatar: string;
  }>;
}

export interface Chapter {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  totalStars: number;
  maxStars: number;
  stages: Stage[];
}

// ========== 竞技场相关 ==========

export interface ArenaOpponent {
  userId: number;
  username: string;
  level: number;
  rank: number;
  points: number;
  power: number;
  formation: Formation[];
  winRate: number;
  lastOnline: string;
}

export interface ArenaRanking {
  rank: number;
  username: string;
  level: number;
  points: number;
  winRate: number;
  avatar: string;
  topHeroes: Array<{
    name: string;
    level: number;
    rarity: RarityLevel;
    avatar: string;
  }>;
}

export interface ArenaRecord {
  currentRank: number;
  bestRank: number;
  points: number;
  totalBattles: number;
  victories: number;
  defeats: number;
  winStreak: number;
  seasonId: number;
}

// ========== 资源相关 ==========

export interface Resources {
  primaryResources: {
    gold: number;
    gems: number;
    energy: number;
    maxEnergy: number;
    energyRegenRate: number;
    nextEnergyTime: string;
  };
  materials: {
    enhancementStones: number;
    skillBooks: number;
    awakeningCrystals: number;
    heroFragments: number;
    equipmentMaterials: number;
  };
  currencies: {
    honor: number;
    guildCoins: number;
    arenaTokens: number;
    eventTokens: number;
  };
}

export interface Item {
  id: number;
  itemId: number;
  name: string;
  description: string;
  category: 'materials' | 'consumables' | 'equipment' | 'fragments';
  rarity: RarityLevel;
  quantity: number;
  maxStack: number;
  icon: string;
  sellPrice: number;
  usable: boolean;
  effects: string[];
  acquiredAt: string;
}

export interface Equipment {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';
  rarity: RarityLevel;
  level: number;
  enhanceLevel: number;
  baseStats: Partial<HeroStats>;
  bonusStats: Partial<HeroStats>;
  setId?: number;
  setName?: string;
  icon: string;
}

export interface ShopItem {
  id: number;
  itemId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  currency: string;
  originalPrice: number;
  discount: number;
  limitType: 'daily' | 'weekly' | 'monthly' | 'total' | 'none';
  limitQuantity: number;
  purchased: number;
  available: boolean;
  rarity: RarityLevel;
  icon: string;
}

export interface Shop {
  type: 'general' | 'arena' | 'guild' | 'event' | 'vip';
  name: string;
  refreshTime: string;
  currency: string;
  items: ShopItem[];
  playerCurrency: number;
  refreshCost: number;
  freeRefreshes: number;
}

// ========== 社交相关 ==========

export interface Friend {
  userId: number;
  username: string;
  level: number;
  avatar: string;
  isOnline: boolean;
  lastOnline: string;
  power: number;
  vipLevel: number;
  friendshipLevel: number;
  dailyInteraction: boolean;
  topHero: {
    name: string;
    level: number;
    rarity: RarityLevel;
    avatar: string;
  };
  addedAt: string;
}

export interface FriendRequest {
  id: number;
  fromUser: {
    userId: number;
    username: string;
    level: number;
    avatar: string;
    power: number;
  };
  message: string;
  createdAt: string;
}

export interface Guild {
  id: number;
  name: string;
  tag: string;
  level: number;
  experience: number;
  maxExperience: number;
  memberCount: number;
  maxMembers: number;
  totalPower: number;
  description: string;
  announcement: string;
  language: string;
  logo: string;
  isRecruiting: boolean;
  requirements: {
    minLevel: number;
    minPower: number;
    approval: boolean;
  };
  leader: {
    username: string;
    level: number;
    lastOnline: string;
  };
  createdAt: string;
}

export interface GuildMember {
  userId: number;
  username: string;
  level: number;
  power: number;
  role: 'leader' | 'officer' | 'elite' | 'member';
  contributionPoints: number;
  weeklyContribution: number;
  totalContribution: number;
  lastOnline: string;
  joinedAt: string;
  avatar: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: number;
  username: string;
  level: number;
  vipLevel: number;
  avatar: string;
  content: string;
  messageType: 'text' | 'system' | 'announcement';
  attachments: any[];
  reactions: any[];
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'world' | 'guild' | 'private' | 'system';
  description: string;
  memberCount: number;
  isActive: boolean;
  cooldown: number;
  permissions: string[];
}

// ========== 任务和成就 ==========

export interface Quest {
  id: string;
  name: string;
  description: string;
  requirement: Record<string, any>;
  reward: Record<string, any>;
  priority: number;
  unlockLevel?: number;
  progress?: number;
  maxProgress?: number;
  completed?: boolean;
  canClaim?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement: Record<string, any>;
  reward: Record<string, any>;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimedAt?: string;
  tier?: number;
}

// ========== WebSocket事件 ==========

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface BattleUpdatePayload {
  battleId: string;
  action: BattleAction;
  result: BattleActionResult;
  nextTurn: any;
}

export interface FriendOnlinePayload {
  friendId: number;
  username: string;
  avatar: string;
}

export interface ChatMessagePayload {
  channelId: string;
  message: ChatMessage;
}

// ========== API请求和响应 ==========

export interface HeroListParams extends PaginationParams {
  sort?: 'level' | 'rarity' | 'faction' | 'power' | 'created';
  order?: 'asc' | 'desc';
  faction?: FactionType;
  rarity?: RarityLevel;
  unitType?: UnitType;
}

export interface BattleHistoryParams extends PaginationParams {
  battleType?: 'all' | 'pve' | 'pvp' | 'guild';
}

export interface ChatHistoryParams {
  limit?: number;
  before?: string;
}

export interface GuildSearchParams extends PaginationParams {
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  language?: string;
  isRecruiting?: boolean;
  sort?: 'level' | 'members' | 'activity' | 'power';
}

// ========== 游戏配置 ==========

export interface GameConfig {
  version: string;
  serverTime: string;
  maintenance: {
    isEnabled: boolean;
    startTime?: string;
    endTime?: string;
    message?: string;
  };
  features: {
    arena: boolean;
    guild: boolean;
    worldBoss: boolean;
    events: boolean;
  };
  limits: {
    maxEnergy: number;
    maxFriends: number;
    dailyEnergyPurchases: number;
    arenaAttemptsPerDay: number;
  };
  rates: {
    energyRegenMinutes: number;
    goldToExpRatio: number;
    heroFragmentCombineCount: number;
  };
}

// ========== 导出所有类型 ==========

export type {
  // 添加其他需要导出的类型
};

// 默认导出主要接口
export default {
  User,
  UserHero,
  Battle,
  Resources,
  Guild,
  Friend,
  ApiResponse,
};