// 基础数据类型
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// 用户相关类型
export interface User extends BaseEntity {
  username: string;
  email: string;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  energy?: number;
  vip_level: number;
  last_login: string;
  avatar?: string;
}

// 英雄相关类型
export interface Hero extends BaseEntity {
  name: string;
  title: string;
  description: string;
  level: number;
  experience: number;
  rarity: number;
  faction: string;
  role: string;
  unit_type: string;
  cost: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  avatar?: string;
  card_image?: string;
  skills: HeroSkill[];
  equipment?: Equipment[];
}

// 技能相关类型
export interface Skill extends BaseEntity {
  name: string;
  description: string;
  skill_type: string;
  target_type: string;
  cost: number;
  cooldown: number;
  damage_base?: number;
  damage_scaling?: number;
  healing_base?: number;
  healing_scaling?: number;
  duration?: number;
  icon?: string;
}

export interface HeroSkill extends BaseEntity {
  name: string;
  description: string;
  skill_type: string;
  target_type: string;
  cost: number;
  cooldown: number;
  damage?: number;
  effect: string;
  icon?: string;
}

// 装备相关类型
export interface Equipment extends BaseEntity {
  name: string;
  description: string;
  equipment_type: string;
  rarity: number;
  level: number;
  health_bonus?: number;
  attack_bonus?: number;
  defense_bonus?: number;
  speed_bonus?: number;
  icon?: string;
}

// 物品相关类型
export interface Item extends BaseEntity {
  name: string;
  description: string;
  item_type: string;
  rarity: number;
  price: number;
  sell_price: number;
  stackable: boolean;
  max_stack: number;
  icon?: string;
}

// 阵容相关类型
export interface Formation extends BaseEntity {
  name: string;
  description?: string;
  positions: FormationPosition[];
  is_active: boolean;
}

export interface FormationPosition {
  position: number; // 0-8 代表3x3网格位置
  hero_id?: number;
  hero?: Hero;
}

// 战斗相关类型
export interface Battle extends BaseEntity {
  battle_type: string;
  status: string;
  player_formation: Formation;
  enemy_formation: Formation;
  result?: string;
  rewards?: BattleReward[];
  battle_log?: BattleAction[];
}

export interface BattleAction {
  turn: number;
  actor_id: number;
  action_type: string;
  target_id?: number;
  skill_id?: number;
  damage?: number;
  healing?: number;
  effects?: string[];
}

export interface BattleReward {
  type: string; // 'hero', 'item', 'gold', 'experience'
  item_id?: number;
  amount: number;
}

// 城池相关类型
export interface City extends BaseEntity {
  name: string;
  description: string;
  level: number;
  population: number;
  prosperity: number;
  buildings: Building[];
}

export interface Building extends BaseEntity {
  name: string;
  description: string;
  building_type: string;
  level: number;
  max_level: number;
  upgrade_cost: number;
  upgrade_time: number;
  production_rate?: number;
  storage_capacity?: number;
  position_x: number;
  position_y: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

// 游戏状态类型
export interface GameState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  heroes: Hero[];
  formations: Formation[];
  currentBattle: Battle | null;
  inventory: InventoryItem[];
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

// UI状态类型
export interface UIState {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectsEnabled: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// 表单类型
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// 组件Props类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// 动画类型
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
}

// 音效类型
export interface AudioConfig {
  volume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectsEnabled: boolean;
}

// 游戏配置类型
export interface GameConfig {
  maxLevel: number;
  maxHeroes: number;
  maxFormations: number;
  battleTimeout: number;
  autoSaveInterval: number;
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  ui: {
    animationDuration: number;
    toastDuration: number;
    pageSize: number;
  };
}

// API请求/响应类型
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

export interface BattleResult extends BaseEntity {
  battleType: string;
  victory: boolean;
  playerFormation: Formation;
  enemyFormation: Formation;
  duration: number;
  actions: BattleAction[];
  rewards: BattleReward[];
  experience: number;
  gold: number;
}

export interface GameStats {
  level: number;
  experience: number;
  maxExperience: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  gems: number;
  honor: number;
  totalHeroes: number;
  totalBattles: number;
  totalVictories: number;
  winRate: number;
  loginDays: number;
  vipLevel: number;
  achievements: Achievement[];
}

export interface Achievement extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: string;
  rewards: BattleReward[];
}

// 事件类型
export type GameEvent =
  | { type: 'HERO_LEVEL_UP'; payload: { heroId: number; newLevel: number } }
  | { type: 'BATTLE_START'; payload: { battleId: number } }
  | { type: 'BATTLE_END'; payload: { battleId: number; result: string } }
  | { type: 'ITEM_ACQUIRED'; payload: { itemId: number; quantity: number } }
  | { type: 'FORMATION_CHANGED'; payload: { formationId: number } };
