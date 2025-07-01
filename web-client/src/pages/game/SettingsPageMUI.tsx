import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Chip,
  Stack,
  Paper,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  VolumeUp,
  Smartphone,
  Language,
  Notifications,
  Security,
  Help,
  RestoreFromTrash,
  Save,
  Info,
  Vibration,
  GraphicEq,
  DataUsage,
  Brightness6,
  Speed,
  AutoMode,
  Download,
  Delete,
  ContactSupport,
  Quiz,
  Feedback,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';

interface GameSettings {
  language: string;
  autoSave: boolean;
  showTips: boolean;
  enableNotifications: boolean;
  enableVibration: boolean;
  animationSpeed: number;
  graphicsQuality: string;
  dataUsage: string;
  volume: number;
  muted: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    language: 'zh-CN',
    autoSave: true,
    showTips: true,
    enableNotifications: true,
    enableVibration: true,
    animationSpeed: 1,
    graphicsQuality: 'high',
    dataUsage: 'normal',
    volume: 70,
    muted: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        setGameSettings({ ...gameSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...gameSettings, ...newSettings };
    setGameSettings(updated);
    
    try {
      localStorage.setItem('gameSettings', JSON.stringify(updated));
      dispatch(addNotification({
        type: 'success',
        title: '设置已保存',
        message: '您的游戏设置已成功保存',
        duration: 3000,
      }));
    } catch (error) {
      console.warn('Failed to save settings:', error);
      dispatch(addNotification({
        type: 'error',
        title: '保存失败',
        message: '设置保存失败，请重试',
        duration: 3000,
      }));
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: GameSettings = {
      language: 'zh-CN',
      autoSave: true,
      showTips: true,
      enableNotifications: true,
      enableVibration: true,
      animationSpeed: 1,
      graphicsQuality: 'high',
      dataUsage: 'normal',
      volume: 70,
      muted: false,
    };

    setGameSettings(defaultSettings);
    localStorage.removeItem('gameSettings');
    
    dispatch(addNotification({
      type: 'success',
      title: '设置已重置',
      message: '所有设置已重置为默认值',
      duration: 3000,
    }));
    
    setIsResetDialogOpen(false);
  };

  const getDeviceInfo = () => {
    return {
      screen: `${window.screen.width} × ${window.screen.height}`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 50) + '...',
    };
  };

  const deviceInfo = getDeviceInfo();

  // 通用设置面板
  const GeneralPanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            语言设置
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>界面语言</InputLabel>
            <Select
              value={gameSettings.language}
              label="界面语言"
              onChange={(e) => saveSettings({ language: e.target.value })}
              startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="zh-CN">简体中文</MenuItem>
              <MenuItem value="zh-TW">繁體中文</MenuItem>
              <MenuItem value="en-US">English</MenuItem>
              <MenuItem value="ja-JP">日本語</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            游戏设置
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Save />
              </ListItemIcon>
              <ListItemText
                primary="自动保存游戏进度"
                secondary="定期自动保存游戏数据"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={gameSettings.autoSave}
                  onChange={(e) => saveSettings({ autoSave: e.target.checked })}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText
                primary="显示游戏提示"
                secondary="在游戏中显示操作提示"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={gameSettings.showTips}
                  onChange={(e) => saveSettings({ showTips: e.target.checked })}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Speed />
              </ListItemIcon>
              <ListItemText
                primary="动画速度"
                secondary={
                  gameSettings.animationSpeed === 0.5 ? '慢' :
                  gameSettings.animationSpeed === 1 ? '正常' : '快'
                }
              />
            </ListItem>
          </List>
          
          <Box sx={{ px: 2, pb: 2 }}>
            <Slider
              value={gameSettings.animationSpeed}
              onChange={(_, value) => saveSettings({ animationSpeed: value as number })}
              min={0.5}
              max={2}
              step={0.5}
              marks={[
                { value: 0.5, label: '慢' },
                { value: 1, label: '正常' },
                { value: 2, label: '快' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );

  // 音频设置面板
  const AudioPanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            音频控制
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <VolumeUp />
              </ListItemIcon>
              <ListItemText
                primary="静音模式"
                secondary="关闭所有游戏音效"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={gameSettings.muted}
                  onChange={(e) => saveSettings({ muted: e.target.checked })}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              音量: {gameSettings.volume}%
            </Typography>
            <Slider
              value={gameSettings.volume}
              onChange={(_, value) => saveSettings({ volume: value as number })}
              disabled={gameSettings.muted}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={`${gameSettings.volume}%`}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            音频测试
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => dispatch(addNotification({
                  type: 'info',
                  title: '音效测试',
                  message: '点击音效已播放',
                  duration: 2000,
                }))}
              >
                点击音效
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => dispatch(addNotification({
                  type: 'success',
                  title: '音效测试',
                  message: '成功音效已播放',
                  duration: 2000,
                }))}
              >
                成功音效
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => dispatch(addNotification({
                  type: 'error',
                  title: '音效测试',
                  message: '错误音效已播放',
                  duration: 2000,
                }))}
              >
                错误音效
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => dispatch(addNotification({
                  type: 'warning',
                  title: '音效测试',
                  message: '警告音效已播放',
                  duration: 2000,
                }))}
              >
                警告音效
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );

  // 界面设置面板
  const InterfacePanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            显示设置
          </Typography>
          <Stack spacing={3}>
            <FormControl fullWidth size="small">
              <InputLabel>图形质量</InputLabel>
              <Select
                value={gameSettings.graphicsQuality}
                label="图形质量"
                onChange={(e) => saveSettings({ graphicsQuality: e.target.value })}
                startAdornment={<GraphicEq sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="low">低</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="ultra">极高</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>数据使用</InputLabel>
              <Select
                value={gameSettings.dataUsage}
                label="数据使用"
                onChange={(e) => saveSettings({ dataUsage: e.target.value })}
                startAdornment={<DataUsage sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="low">省流量</MenuItem>
                <MenuItem value="normal">正常</MenuItem>
                <MenuItem value="high">高质量</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            设备信息
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="屏幕分辨率"
                secondary={deviceInfo.screen}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="视口大小"
                secondary={deviceInfo.viewport}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="设备像素比"
                secondary={deviceInfo.pixelRatio}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="平台"
                secondary={deviceInfo.platform}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="用户代理"
                secondary={deviceInfo.userAgent}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Stack>
  );

  // 通知设置面板
  const NotificationPanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            推送通知
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="启用推送通知"
                secondary="接收游戏相关通知"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={gameSettings.enableNotifications}
                  onChange={(e) => saveSettings({ enableNotifications: e.target.checked })}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Vibration />
              </ListItemIcon>
              <ListItemText
                primary="震动反馈"
                secondary="触觉反馈增强体验"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={gameSettings.enableVibration}
                  onChange={(e) => saveSettings({ enableVibration: e.target.checked })}
                  disabled={!('vibrate' in navigator)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            通知权限
          </Typography>
          <Alert 
            severity={
              Notification.permission === 'granted' ? 'success' :
              Notification.permission === 'denied' ? 'error' : 'info'
            }
            sx={{ mb: 2 }}
          >
            当前通知权限状态: {
              Notification.permission === 'granted' ? '已授权' :
              Notification.permission === 'denied' ? '已拒绝' : '未设置'
            }
          </Alert>
          
          {Notification.permission === 'default' && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => Notification.requestPermission()}
            >
              请求通知权限
            </Button>
          )}
        </CardContent>
      </Card>
    </Stack>
  );

  // 隐私安全面板
  const PrivacyPanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            数据管理
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              fullWidth
              onClick={() => {
                const data = JSON.stringify(gameSettings, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'game-settings.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              导出游戏数据
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Delete />}
              fullWidth
              onClick={() => {
                localStorage.clear();
                dispatch(addNotification({
                  type: 'success',
                  title: '缓存已清除',
                  message: '所有本地缓存数据已清除',
                  duration: 3000,
                }));
              }}
            >
              清除缓存数据
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<RestoreFromTrash />}
              fullWidth
              onClick={() => setIsResetDialogOpen(true)}
            >
              重置所有设置
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            隐私信息
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            本游戏仅在本地存储游戏数据，不会上传个人信息。
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            音频设置和游戏偏好存储在浏览器本地存储中。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            您可以随时清除这些数据。
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );

  // 帮助支持面板
  const HelpPanel = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            游戏信息
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="游戏版本"
                secondary="v1.0.0"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="构建时间"
                secondary={new Date().toLocaleDateString()}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="浏览器"
                secondary={navigator.userAgent.split(' ')[0]}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            帮助链接
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<School />}
              fullWidth
              onClick={() => dispatch(addNotification({
                type: 'info',
                title: '游戏教程',
                message: '游戏教程功能即将开放',
                duration: 3000,
              }))}
            >
              游戏教程
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Quiz />}
              fullWidth
              onClick={() => dispatch(addNotification({
                type: 'info',
                title: '常见问题',
                message: '常见问题功能即将开放',
                duration: 3000,
              }))}
            >
              常见问题
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ContactSupport />}
              fullWidth
              onClick={() => dispatch(addNotification({
                type: 'info',
                title: '联系客服',
                message: '客服功能即将开放',
                duration: 3000,
              }))}
            >
              联系客服
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Feedback />}
              fullWidth
              onClick={() => dispatch(addNotification({
                type: 'info',
                title: '用户反馈',
                message: '反馈功能即将开放',
                duration: 3000,
              }))}
            >
              用户反馈
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const tabLabels = [
    { label: '通用', icon: <Settings /> },
    { label: '音频', icon: <VolumeUp /> },
    { label: '界面', icon: <Smartphone /> },
    { label: '通知', icon: <Notifications /> },
    { label: '隐私', icon: <Security /> },
    { label: '帮助', icon: <Help /> },
  ];

  return (
    <Container maxWidth="lg" disableGutters>
      {/* 顶部应用栏 */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            游戏设置
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabLabels.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      <Container maxWidth="md" sx={{ py: 2 }}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TabPanel value={activeTab} index={0}>
            <GeneralPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AudioPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <InterfacePanel />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <NotificationPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <PrivacyPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <HelpPanel />
          </TabPanel>
        </motion.div>
      </Container>

      {/* 重置确认对话框 */}
      <Dialog
        open={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
      >
        <DialogTitle>重置设置</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要重置所有设置到默认值吗？
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
            这将清除所有自定义设置，包括音频配置、界面偏好等。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResetDialogOpen(false)}>取消</Button>
          <Button onClick={handleResetSettings} color="error" autoFocus>
            确认重置
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPageMUI;