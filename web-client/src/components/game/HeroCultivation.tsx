import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Star,
  StarBorder,
  AutoAwesome,
  MonetizationOn,
  Diamond,
  Psychology,
  Flare,
  EmojiEvents,
  Whatshot,
  Add,
  Remove,
  Info,
  Check,
  ArrowUpward,
  Favorite,
  Shield,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroData {
  id: number;
  name: string;
  level?: number;
  experience?: number;
  maxExperience?: number;
  rarity?: number;
  quality?: number;
  power?: number;
  base_hp?: number;
  base_attack?: number;
  base_defense?: number;
  base_speed?: number;
  baseStats?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  awakening?: {
    stage: number;
    isAwakened: boolean;
    nextStageRequirements?: any;
  };
}

interface UserResources {
  gold: number;
  diamond: number;
  stardust: number;
  heroFragments: number;
  experience: number;
}

interface HeroCultivationProps {
  hero: HeroData;
  userResources: UserResources;
  onLevelUp: (heroId: number, data: any) => Promise<void>;
  onStarUp: (heroId: number, data: any) => Promise<void>;
  onAwaken: (heroId: number, data: any) => Promise<void>;
}

const HeroCultivation: React.FC<HeroCultivationProps> = ({
  hero,
  userResources,
  onLevelUp,
  onStarUp,
  onAwaken,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [levelUpDialog, setLevelUpDialog] = useState(false);
  const [starUpDialog, setStarUpDialog] = useState(false);
  const [awakenDialog, setAwakenDialog] = useState(false);
  
  // 升级相关状态
  const [targetLevel, setTargetLevel] = useState((hero.level || 1) + 1);
  const [useGold, setUseGold] = useState(0);
  
  // 升星相关状态
  const [useFragments, setUseFragments] = useState(0);
  const [useSameHero, setUseSameHero] = useState(false);
  
  // 觉醒相关状态
  const [awakenMaterials, setAwakenMaterials] = useState({
    awakening_crystals: 0,
    hero_essence: 0,
    divine_fragments: 0,
    celestial_orb: 0,
  });

  // 计算升级费用
  const calculateLevelUpCost = () => {
    const levelDiff = targetLevel - (hero.level || 1);
    const goldPerLevel = 1000;
    return levelDiff * goldPerLevel;
  };

  // 计算升星所需碎片
  const getStarUpFragments = (star: number) => {
    const requirements = { 2: 10, 3: 20, 4: 50, 5: 100, 6: 200 };
    return requirements[star] || 0;
  };

  // 处理升级
  const handleLevelUp = async () => {
    try {
      await onLevelUp(hero.id, {
        targetLevel,
        useGold,
        useItems: []
      });
      setLevelUpDialog(false);
    } catch (error) {
      console.error('升级失败:', error);
    }
  };

  // 处理升星
  const handleStarUp = async () => {
    try {
      await onStarUp(hero.id, {
        useFragments,
        useSameHero
      });
      setStarUpDialog(false);
    } catch (error) {
      console.error('升星失败:', error);
    }
  };

  // 处理觉醒
  const handleAwaken = async () => {
    try {
      await onAwaken(hero.id, {
        materials: awakenMaterials
      });
      setAwakenDialog(false);
    } catch (error) {
      console.error('觉醒失败:', error);
    }
  };

  // 渲染星级显示
  const renderStars = (current: number, max: number = 6) => {
    return (
      <Stack direction="row" spacing={0.5}>
        {Array.from({ length: max }, (_, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {index < current ? (
              <Star sx={{ color: '#ffd700', fontSize: '1.5rem' }} />
            ) : (
              <StarBorder sx={{ color: '#666', fontSize: '1.5rem' }} />
            )}
          </motion.div>
        ))}
      </Stack>
    );
  };

  // 渲染属性条
  const renderStatBar = (label: string, value: number, icon: React.ReactNode, color: string) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
          {label}: {value.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min((value / 10000) * 100, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          }
        }}
      />
    </Box>
  );

  return (
    <Box>
      {/* 培养选项卡 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeTab === 0 ? '2px solid #ff6b35' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
              onClick={() => setActiveTab(0)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TrendingUp sx={{ color: '#4caf50', fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>升级</Typography>
                <Typography variant="body2" color="text.secondary">
                  等级 {hero.level || 1}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={4}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeTab === 1 ? '2px solid #ff6b35' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
              onClick={() => setActiveTab(1)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Star sx={{ color: '#ffd700', fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>升星</Typography>
                <Typography variant="body2" color="text.secondary">
                  {hero.rarity || hero.quality || 1}星
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={4}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeTab === 2 ? '2px solid #ff6b35' : '2px solid transparent',
                transition: 'all 0.3s',
                opacity: (hero.rarity || hero.quality || 1) < 6 ? 0.5 : 1
              }}
              onClick={() => (hero.rarity || hero.quality || 1) >= 6 && setActiveTab(2)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AutoAwesome sx={{ color: '#9c27b0', fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>觉醒</Typography>
                <Typography variant="body2" color="text.secondary">
                  {hero.awakening?.isAwakened ? `第${hero.awakening.stage}阶` : '未觉醒'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* 培养内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* 升级面板 */}
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  等级提升
                </Typography>
                
                {/* 经验条 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      等级 {hero.level || 1}
                    </Typography>
                    <Typography variant="body2">
                      {hero.experience || 0}/{(hero.level || 1) * 1000}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={((hero.experience || 0) / ((hero.level || 1) * 1000)) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {/* 当前属性 */}
                <Typography variant="subtitle1" gutterBottom>当前属性</Typography>
                {renderStatBar('生命值', hero.base_hp || hero.baseStats?.hp || 3000, <Favorite sx={{ color: '#e91e63' }} />, '#e91e63')}
                {renderStatBar('攻击力', hero.base_attack || hero.baseStats?.attack || 400, <Whatshot sx={{ color: '#ff5722' }} />, '#ff5722')}
                {renderStatBar('防御力', hero.base_defense || hero.baseStats?.defense || 400, <Shield sx={{ color: '#2196f3' }} />, '#2196f3')}
                {renderStatBar('速度', hero.base_speed || hero.baseStats?.speed || 80, <Flare sx={{ color: '#ff9800' }} />, '#ff9800')}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => setLevelUpDialog(true)}
                  sx={{ mt: 2 }}
                >
                  升级武将
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 升星面板 */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  星级提升
                </Typography>
                
                {/* 星级显示 */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {renderStars(hero.rarity || hero.quality || 1)}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {hero.rarity || hero.quality || 1}/6 星
                  </Typography>
                </Box>

                {/* 升星效果 */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  升星可大幅提升武将属性，并解锁特殊技能
                </Alert>

                {(hero.rarity || hero.quality || 1) < 6 ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Star />}
                    onClick={() => setStarUpDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    升星至 {(hero.rarity || hero.quality || 1) + 1} 星
                  </Button>
                ) : (
                  <Alert severity="success">
                    武将已达到最高星级！
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 觉醒面板 */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  觉醒系统
                </Typography>
                
                {(hero.rarity || hero.quality || 1) < 6 ? (
                  <Alert severity="warning">
                    武将必须达到6星才能觉醒
                  </Alert>
                ) : (hero.level || 1) < 50 ? (
                  <Alert severity="warning">
                    武将必须达到50级才能觉醒
                  </Alert>
                ) : (
                  <>
                    {/* 觉醒阶段 */}
                    <Stepper activeStep={hero.awakening?.stage || 0} orientation="vertical">
                      <Step>
                        <StepLabel>初次觉醒</StepLabel>
                        <StepContent>
                          <Typography>全属性提升15%，解锁觉醒技能</Typography>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>二次觉醒</StepLabel>
                        <StepContent>
                          <Typography>全属性提升30%，觉醒技能强化</Typography>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>终极觉醒</StepLabel>
                        <StepContent>
                          <Typography>全属性提升50%，解锁终极技能</Typography>
                        </StepContent>
                      </Step>
                    </Stepper>

                    {(hero.awakening?.stage || 0) < 3 && (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AutoAwesome />}
                        onClick={() => setAwakenDialog(true)}
                        sx={{ mt: 2, background: 'linear-gradient(45deg, #9c27b0, #e91e63)' }}
                      >
                        觉醒至第 {(hero.awakening?.stage || 0) + 1} 阶
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 升级对话框 */}
      <Dialog open={levelUpDialog} onClose={() => setLevelUpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>武将升级</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>目标等级</Typography>
            <Slider
              value={targetLevel}
              onChange={(_, value) => setTargetLevel(value as number)}
              min={(hero.level || 1) + 1}
              max={Math.min((hero.level || 1) + 10, 100)}
              step={1}
              marks
              valueLabelDisplay="on"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>使用金币</Typography>
            <TextField
              fullWidth
              type="number"
              value={useGold}
              onChange={(e) => setUseGold(Number(e.target.value))}
              InputProps={{
                startAdornment: <MonetizationOn sx={{ color: '#ffc107', mr: 1 }} />,
              }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              预计费用: {calculateLevelUpCost()} 金币
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLevelUpDialog(false)}>取消</Button>
          <Button onClick={handleLevelUp} variant="contained">确认升级</Button>
        </DialogActions>
      </Dialog>

      {/* 升星对话框 */}
      <Dialog open={starUpDialog} onClose={() => setStarUpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>武将升星</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>
              升至 {(hero.rarity || hero.quality || 1) + 1} 星需要:
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              需要 {getStarUpFragments((hero.rarity || hero.quality || 1) + 1)} 个碎片或同名武将
            </Alert>
            
            <FormControlLabel
              control={
                <Switch
                  checked={useSameHero}
                  onChange={(e) => setUseSameHero(e.target.checked)}
                />
              }
              label="使用同名武将"
            />
            
            {!useSameHero && (
              <TextField
                fullWidth
                type="number"
                label="使用碎片"
                value={useFragments}
                onChange={(e) => setUseFragments(Number(e.target.value))}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStarUpDialog(false)}>取消</Button>
          <Button onClick={handleStarUp} variant="contained">确认升星</Button>
        </DialogActions>
      </Dialog>

      {/* 觉醒对话框 */}
      <Dialog open={awakenDialog} onClose={() => setAwakenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>武将觉醒</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>
              觉醒至第 {(hero.awakening?.stage || 0) + 1} 阶需要:
            </Typography>
            
            {hero.awakening?.nextStageRequirements && (
              <List>
                {Object.entries(hero.awakening.nextStageRequirements).map(([material, amount]) => (
                  <ListItem key={material}>
                    <ListItemIcon>
                      <Diamond sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={material}
                      secondary={`需要: ${amount}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAwakenDialog(false)}>取消</Button>
          <Button onClick={handleAwaken} variant="contained">确认觉醒</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeroCultivation;