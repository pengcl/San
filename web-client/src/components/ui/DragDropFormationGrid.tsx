import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tooltip,
  Chip,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import {
  Person,
  Add,
  Close,
  Star,
  Shield,
  LocalFireDepartment,
  Speed,
  Favorite,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getQualityColor, getQualityGradient } from '../../utils/qualityColors';

export interface FormationHero {
  id: number;
  heroId: number;
  name: string;
  level: number;
  rarity: number;
  faction: string;
  unitType: string;
  avatar?: string;
  power: number;
  stats: {
    attack: number;
    defense: number;
    hp: number;
    speed: number;
  };
}

export interface FormationPosition {
  position: number; // 0-8 for 3x3 grid
  hero: FormationHero | null;
}

interface ClickFormationGridProps {
  formation: FormationPosition[];
  availableHeroes: FormationHero[];
  onFormationChange: (formation: FormationPosition[]) => void;
  readonly?: boolean;
  showPowerCalculation?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ClickFormationGrid: React.FC<ClickFormationGridProps> = ({
  formation,
  availableHeroes,
  onFormationChange,
  readonly = false,
  showPowerCalculation = true,
  size = 'medium',
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  // 获取位置名称
  const getPositionName = (position: number): string => {
    const names = [
      '前排左', '前排中', '前排右',
      '中排左', '中排中', '中排右',
      '后排左', '后排中', '后排右'
    ];
    return names[position] || '未知位置';
  };

  // 获取位置类型
  const getPositionType = (position: number): string => {
    if (position < 3) return 'front';
    if (position < 6) return 'middle';
    return 'back';
  };

  // 获取位置颜色
  const getPositionColor = (position: number): string => {
    const type = getPositionType(position);
    switch (type) {
      case 'front': return '#ff5722'; // 红色 - 前排
      case 'middle': return '#ff9800'; // 橙色 - 中排
      case 'back': return '#4caf50'; // 绿色 - 后排
      default: return '#9e9e9e';
    }
  };

  // 点击阵容位置
  const handlePositionClick = useCallback((position: number) => {
    if (readonly) return;
    setSelectedPosition(selectedPosition === position ? null : position);
  }, [selectedPosition, readonly]);

  // 点击武将，将其放入选中的位置
  const handleHeroClick = useCallback((hero: FormationHero) => {
    if (readonly || selectedPosition === null) return;

    const newFormation = [...formation];
    newFormation[selectedPosition] = { position: selectedPosition, hero };
    onFormationChange(newFormation);
    setSelectedPosition(null); // 清除选中状态
  }, [formation, selectedPosition, onFormationChange, readonly]);

  // 移除武将
  const removeHero = useCallback((position: number) => {
    if (readonly) return;
    
    const newFormation = [...formation];
    newFormation[position] = { position, hero: null };
    onFormationChange(newFormation);
  }, [formation, onFormationChange, readonly]);

  // 计算总战力
  const totalPower = formation.reduce((sum, pos) => 
    sum + (pos.hero?.power || 0), 0
  );

  // 部署的武将数量
  const deployedCount = formation.filter(pos => pos.hero).length;

  const gridSize = {
    small: { width: 60, height: 80 },
    medium: { width: 80, height: 100 },
    large: { width: 100, height: 120 },
  }[size];

  return (
    <Box>
      {/* 阵容统计信息 */}
      {showPowerCalculation && (
        <Card sx={{ mb: 2, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  总战力
                </Typography>
                <Typography variant="h6" color="#ff6b35" fontWeight="bold">
                  {totalPower.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  部署武将
                </Typography>
                <Typography variant="h6" color="white">
                  {deployedCount} / 9
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="前排坦克" size="small" sx={{ bgcolor: '#ff572240' }} />
                  <Chip label="中排输出" size="small" sx={{ bgcolor: '#ff980040' }} />
                  <Chip label="后排支援" size="small" sx={{ bgcolor: '#4caf5040' }} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 操作提示 */}
      {!readonly && selectedPosition !== null && (
        <Card sx={{ mb: 2, background: 'linear-gradient(45deg, #ff6b35, #f9ca24)' }}>
          <CardContent sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
              已选择位置：{getPositionName(selectedPosition)} - 请点击下方武将列表中的武将进行部署
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* 3x3 阵容网格 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              阵容布局 {!readonly && '(点击位置进行选择)'}
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 1,
              maxWidth: 320,
              mx: 'auto'
            }}>
              {formation.map((position, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: readonly ? 1 : 1.05 }}
                  whileTap={{ scale: readonly ? 1 : 0.95 }}
                >
                  <Box
                    onClick={() => handlePositionClick(index)}
                    onMouseEnter={() => setHoveredPosition(index)}
                    onMouseLeave={() => setHoveredPosition(null)}
                    sx={{
                      width: gridSize.width,
                      height: gridSize.height,
                      border: 2,
                      borderColor: selectedPosition === index 
                        ? '#ff6b35' 
                        : getPositionColor(index) + '40',
                      borderRadius: 2,
                      background: selectedPosition === index
                        ? 'linear-gradient(45deg, #ff6b3540, #f9ca2440)'
                        : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: readonly ? 'default' : 'pointer',
                      '&:hover': {
                        borderColor: readonly ? undefined : '#ff6b35',
                        boxShadow: readonly ? undefined : '0 0 10px rgba(255,107,53,0.3)',
                      }
                    }}
                  >
                    {position.hero ? (
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                      }}>
                        <Tooltip title={`${position.hero.name} (Lv.${position.hero.level})`}>
                          <Card sx={{
                            width: '100%',
                            height: '100%',
                            border: `2px solid ${getQualityColor(position.hero.rarity)}`,
                            background: getQualityGradient(position.hero.rarity),
                          }}>
                            <CardContent sx={{ p: 0.5, textAlign: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mx: 'auto',
                                  mb: 0.5,
                                  fontSize: '1rem'
                                }}
                              >
                                {position.hero.name[0]}
                              </Avatar>
                              <Typography variant="caption" sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                fontSize: '0.6rem'
                              }}>
                                Lv.{position.hero.level}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Tooltip>
                        
                        {/* 移除按钮 */}
                        {!readonly && (
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHero(index);
                            }}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: '#f44336',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '12px',
                              opacity: hoveredPosition === index ? 1 : 0,
                              transition: 'opacity 0.2s',
                              '&:hover': {
                                opacity: 1,
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Close sx={{ fontSize: 12 }} />
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedPosition === index ? '#ff6b35' : 'rgba(255,255,255,0.5)'
                      }}>
                        <Add sx={{ fontSize: 24, mb: 0.5 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                          {getPositionName(index).slice(0, 2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
            
            {/* 位置说明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Chip 
                  label="前排（坦克）" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#ff572240', 
                    color: '#ff5722',
                    fontSize: '0.7rem'
                  }} 
                />
                <Chip 
                  label="中排（输出）" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#ff980040', 
                    color: '#ff9800',
                    fontSize: '0.7rem'
                  }} 
                />
                <Chip 
                  label="后排（支援）" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#4caf5040', 
                    color: '#4caf50',
                    fontSize: '0.7rem'
                  }} 
                />
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* 可用武将列表 */}
        {!readonly && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                可用武将 {selectedPosition !== null && '(点击武将进行部署)'}
              </Typography>
              
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableHeroes.map((hero, index) => (
                  <motion.div
                    key={hero.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => handleHeroClick(hero)}
                      sx={{
                        mb: 1,
                        cursor: selectedPosition !== null ? 'pointer' : 'default',
                        border: `1px solid ${getQualityColor(hero.rarity)}40`,
                        background: 'rgba(255,255,255,0.05)',
                        opacity: selectedPosition !== null ? 1 : 0.7,
                        '&:hover': {
                          background: selectedPosition !== null ? getQualityGradient(hero.rarity) + '20' : undefined,
                          borderColor: selectedPosition !== null ? getQualityColor(hero.rarity) : undefined,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            border: `1px solid ${getQualityColor(hero.rarity)}`
                          }}>
                            {hero.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                              {hero.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Lv.{hero.level} • {hero.faction} • {hero.unitType}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                            {hero.power.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DragDropFormationGrid;