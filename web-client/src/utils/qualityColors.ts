/**
 * 品质颜色系统
 * 基于游戏设计文档的6级品质系统
 */

export interface QualityInfo {
  id: number;
  name: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  starColor: string;
}

// 6级品质系统配置
export const QUALITY_CONFIG: Record<number, QualityInfo> = {
  1: {
    id: 1,
    name: '普通',
    color: '#808080',
    bgGradient: 'linear-gradient(135deg, #808080 0%, #606060 100%)',
    borderColor: '#606060',
    glowColor: 'rgba(128, 128, 128, 0.3)',
    starColor: '#808080'
  },
  2: {
    id: 2,
    name: '优秀',
    color: '#00FF00',
    bgGradient: 'linear-gradient(135deg, #00FF00 0%, #00CC00 100%)',
    borderColor: '#00CC00',
    glowColor: 'rgba(0, 255, 0, 0.3)',
    starColor: '#00FF00'
  },
  3: {
    id: 3,
    name: '精良',
    color: '#0080FF',
    bgGradient: 'linear-gradient(135deg, #0080FF 0%, #0066CC 100%)',
    borderColor: '#0066CC',
    glowColor: 'rgba(0, 128, 255, 0.3)',
    starColor: '#0080FF'
  },
  4: {
    id: 4,
    name: '史诗',
    color: '#8000FF',
    bgGradient: 'linear-gradient(135deg, #8000FF 0%, #6600CC 100%)',
    borderColor: '#6600CC',
    glowColor: 'rgba(128, 0, 255, 0.3)',
    starColor: '#8000FF'
  },
  5: {
    id: 5,
    name: '传说',
    color: '#FF8000',
    bgGradient: 'linear-gradient(135deg, #FF8000 0%, #CC6600 100%)',
    borderColor: '#CC6600',
    glowColor: 'rgba(255, 128, 0, 0.3)',
    starColor: '#FF8000'
  },
  6: {
    id: 6,
    name: '神话',
    color: '#FF0000',
    bgGradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    borderColor: '#CC0000',
    glowColor: 'rgba(255, 0, 0, 0.5)',
    starColor: '#FFD700'
  }
};

// 获取品质信息
export const getQualityInfo = (quality: number): QualityInfo => {
  return QUALITY_CONFIG[quality] || QUALITY_CONFIG[1];
};

// 获取品质颜色
export const getQualityColor = (quality: number): string => {
  return getQualityInfo(quality).color;
};

// 获取品质背景渐变
export const getQualityGradient = (quality: number): string => {
  return getQualityInfo(quality).bgGradient;
};

// 获取品质边框颜色
export const getQualityBorderColor = (quality: number): string => {
  return getQualityInfo(quality).borderColor;
};

// 获取品质发光效果
export const getQualityGlow = (quality: number): string => {
  const info = getQualityInfo(quality);
  if (quality >= 5) {
    // 传说和神话级别有更强的发光效果
    return `0 0 20px ${info.glowColor}, 0 0 40px ${info.glowColor}`;
  }
  return `0 0 10px ${info.glowColor}`;
};

// 获取品质动画类名
export const getQualityAnimation = (quality: number): string => {
  if (quality === 6) return 'mythic-glow';
  if (quality === 5) return 'legendary-glow';
  if (quality === 4) return 'epic-glow';
  return '';
};