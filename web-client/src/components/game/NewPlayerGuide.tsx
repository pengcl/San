import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Person,
  AutoAwesome,
  Shield,
  SportsMartialArts,
  Star,
  CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

interface NewPlayerGuideProps {
  open: boolean;
  onClose: () => void;
}

const NewPlayerGuide: React.FC<NewPlayerGuideProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [key: number]: boolean }>({});

  const steps = [
    {
      label: '欢迎来到三国英雄传',
      title: '开始您的三国征程',
      description: '在这个充满策略与智慧的世界中，您将招募三国名将，征战沙场，统一天下！',
      icon: <Star sx={{ fontSize: '3rem', color: '#ff6b35' }} />,
      action: null,
    },
    {
      label: '免费召唤武将',
      title: '获得您的第一位武将',
      description: '每位新玩家都可以免费召唤一次，获得强力武将开始您的冒险！',
      icon: <AutoAwesome sx={{ fontSize: '3rem', color: '#e91e63' }} />,
      action: () => navigate('/summon'),
      actionText: '前往召唤',
    },
    {
      label: '了解武将系统',
      title: '查看您的武将',
      description: '武将是战斗的核心，您可以查看武将属性、技能，并进行培养提升。',
      icon: <Person sx={{ fontSize: '3rem', color: '#2196f3' }} />,
      action: () => navigate('/heroes'),
      actionText: '查看武将',
    },
    {
      label: '配置战斗阵容',
      title: '组建您的队伍',
      description: '合理的阵容搭配是获胜的关键，不同位置和武将类型会影响战斗效果。',
      icon: <Shield sx={{ fontSize: '3rem', color: '#4caf50' }} />,
      action: () => navigate('/formation'),
      actionText: '配置阵容',
    },
    {
      label: '开始第一场战斗',
      title: '踏上征战之路',
      description: '现在是时候测试您的实力了！选择合适的关卡，开始您的首战！',
      icon: <SportsMartialArts sx={{ fontSize: '3rem', color: '#ff5722' }} />,
      action: () => navigate('/battle/stages'),
      actionText: '开始战斗',
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // 引导完成
      handleComplete();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleStepAction = () => {
    const currentStep = steps[activeStep];
    if (currentStep.action) {
      // 标记当前步骤为完成
      setCompleted(prev => ({
        ...prev,
        [activeStep]: true
      }));
      
      // 执行操作
      currentStep.action();
      
      // 关闭引导
      onClose();
      
      // 显示提示
      dispatch(addNotification({
        type: 'info',
        title: '新手引导',
        message: `完成后回到主页可继续查看引导`,
        duration: 5000,
      }));
    } else {
      handleNext();
    }
  };

  const handleComplete = () => {
    // 保存引导完成状态到本地存储
    localStorage.setItem('newPlayerGuideCompleted', 'true');
    
    onClose();
    
    dispatch(addNotification({
      type: 'success',
      title: '新手引导完成！',
      message: '现在您可以开始探索更多游戏内容了',
      duration: 5000,
    }));
  };

  const handleSkip = () => {
    localStorage.setItem('newPlayerGuideCompleted', 'true');
    onClose();
  };

  const currentStep = steps[activeStep];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          color: 'white',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }}>
            新手引导
          </Typography>
          <IconButton onClick={handleSkip} sx={{ color: 'white' }} size="small">
            <Close />
          </IconButton>
        </Box>
        
        {/* 进度条 */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ff6b35',
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'gray', mt: 1, display: 'block' }}>
            {activeStep + 1} / {steps.length}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              sx={{ 
                background: 'linear-gradient(45deg, #2a2a2a, #3a3a3a)',
                border: '1px solid #444',
                mb: 3
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 3 }}>
                  {currentStep.icon}
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#ff6b35' }}>
                  {currentStep.title}
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'white', lineHeight: 1.6 }}>
                  {currentStep.description}
                </Typography>
                
                {completed[activeStep] && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<CheckCircle />}
                      label="已完成"
                      sx={{
                        bgcolor: '#4caf50',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* 步骤指示器 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: index <= activeStep ? '#ff6b35' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              上一步
            </Button>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            onClick={handleStepAction}
            variant="contained"
            startIcon={currentStep.action ? <PlayArrow /> : null}
            sx={{
              background: 'linear-gradient(45deg, #ff6b35, #ff8a50)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5722, #ff6b35)',
              },
              minWidth: 120,
            }}
          >
            {currentStep.actionText || (activeStep === steps.length - 1 ? '完成引导' : '下一步')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default NewPlayerGuide;