/**
 * 设置页面
 * 提供游戏设置、音频控制、界面配置等功能
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  Cog6ToothIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card, Switch, Slider, Select, Button, Divider, Modal, message } from 'antd';
import { selectScreen } from '../../store/slices/uiSlice';
import { useAudioConfig } from '../../hooks/useAudio';
import AudioControls from '../../components/audio/AudioControls';
import VolumeIndicator from '../../components/audio/VolumeIndicator';
import AudioButton from '../../components/ui/AudioButton';
import { useNavigate } from 'react-router-dom';

interface GameSettings {
  language: string;
  autoSave: boolean;
  showTips: boolean;
  enableNotifications: boolean;
  enableVibration: boolean;
  animationSpeed: number;
  graphicsQuality: string;
  dataUsage: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screen = useSelector(selectScreen);
  const audioConfig = useAudioConfig();

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    language: 'zh-CN',
    autoSave: true,
    showTips: true,
    enableNotifications: true,
    enableVibration: true,
    animationSpeed: 1,
    graphicsQuality: 'high',
    dataUsage: 'normal',
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // 加载本地设置
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
      message.success('设置已保存');
    } catch (error) {
      console.warn('Failed to save settings:', error);
      message.error('保存设置失败');
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
    };

    setGameSettings(defaultSettings);
    localStorage.removeItem('gameSettings');
    localStorage.removeItem('gameAudioConfig');
    
    // 重置音频设置
    audioConfig.updateVolume(0.7);
    audioConfig.toggleMute(); // If muted, unmute
    
    message.success('设置已重置为默认值');
    setIsResetModalOpen(false);
  };

  const settingsTabs = [
    { key: 'general', label: '通用设置', icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { key: 'audio', label: '音频设置', icon: <SpeakerWaveIcon className="w-5 h-5" /> },
    { key: 'interface', label: '界面设置', icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
    { key: 'notifications', label: '通知设置', icon: <BellIcon className="w-5 h-5" /> },
    { key: 'privacy', label: '隐私安全', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { key: 'help', label: '帮助支持', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
  ];

  // 通用设置面板
  const GeneralSettingsPanel = () => (
    <div className="space-y-6">
      <Card title="语言设置" size="small">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LanguageIcon className="w-5 h-5 text-gray-500" />
            <span>界面语言</span>
          </div>
          <Select
            value={gameSettings.language}
            onChange={(value) => saveSettings({ language: value })}
            style={{ width: 120 }}
            options={[
              { value: 'zh-CN', label: '简体中文' },
              { value: 'zh-TW', label: '繁體中文' },
              { value: 'en-US', label: 'English' },
              { value: 'ja-JP', label: '日本語' },
            ]}
          />
        </div>
      </Card>

      <Card title="游戏设置" size="small">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>自动保存游戏进度</span>
            <Switch
              checked={gameSettings.autoSave}
              onChange={(checked) => saveSettings({ autoSave: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span>显示游戏提示</span>
            <Switch
              checked={gameSettings.showTips}
              onChange={(checked) => saveSettings({ showTips: checked })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>动画速度</span>
              <span className="text-sm text-gray-500">
                {gameSettings.animationSpeed === 0.5 ? '慢' :
                 gameSettings.animationSpeed === 1 ? '正常' : '快'}
              </span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.5}
              value={gameSettings.animationSpeed}
              onChange={(value) => saveSettings({ animationSpeed: value })}
              marks={{
                0.5: '慢',
                1: '正常',
                2: '快',
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  // 音频设置面板
  const AudioSettingsPanel = () => (
    <div className="space-y-6">
      <Card title="音频控制" size="small">
        <div className="space-y-4">
          <AudioControls variant="full" showLabels={true} orientation="vertical" />
          
          <Divider />
          
          <div className="flex items-center justify-between">
            <span>音量指示器</span>
            <VolumeIndicator size="medium" showValue={true} animated={true} />
          </div>
        </div>
      </Card>

      <Card title="音频测试" size="small">
        <div className="grid grid-cols-2 gap-3">
          <AudioButton soundType="click" size="small">
            点击音效
          </AudioButton>
          <AudioButton soundType="success" size="small">
            成功音效
          </AudioButton>
          <AudioButton soundType="error" size="small">
            错误音效
          </AudioButton>
          <AudioButton soundType="none" size="small">
            无音效
          </AudioButton>
        </div>
      </Card>
    </div>
  );

  // 界面设置面板
  const InterfaceSettingsPanel = () => (
    <div className="space-y-6">
      <Card title="显示设置" size="small">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>图形质量</span>
            <Select
              value={gameSettings.graphicsQuality}
              onChange={(value) => saveSettings({ graphicsQuality: value })}
              style={{ width: 100 }}
              options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
                { value: 'ultra', label: '极高' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>数据使用</span>
            <Select
              value={gameSettings.dataUsage}
              onChange={(value) => saveSettings({ dataUsage: value })}
              style={{ width: 100 }}
              options={[
                { value: 'low', label: '省流量' },
                { value: 'normal', label: '正常' },
                { value: 'high', label: '高质量' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title="适配信息" size="small">
        <div className="text-sm text-gray-600 space-y-2">
          <div>屏幕类型: {screen.isMobile ? '移动设备' : '桌面设备'}</div>
          <div>屏幕尺寸: {screen.width} × {screen.height}</div>
          <div>设备像素比: {window.devicePixelRatio}</div>
          <div>用户代理: {navigator.userAgent.slice(0, 50)}...</div>
        </div>
      </Card>
    </div>
  );

  // 通知设置面板
  const NotificationSettingsPanel = () => (
    <div className="space-y-6">
      <Card title="推送通知" size="small">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>启用推送通知</span>
            <Switch
              checked={gameSettings.enableNotifications}
              onChange={(checked) => saveSettings({ enableNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>震动反馈</span>
            <Switch
              checked={gameSettings.enableVibration}
              onChange={(checked) => saveSettings({ enableVibration: checked })}
              disabled={!('vibrate' in navigator)}
            />
          </div>
        </div>
      </Card>

      <Card title="通知权限" size="small">
        <div className="text-sm text-gray-600">
          <p>当前通知权限状态: {Notification.permission}</p>
          {Notification.permission === 'default' && (
            <Button
              size="small"
              onClick={() => Notification.requestPermission()}
              className="mt-2"
            >
              请求通知权限
            </Button>
          )}
        </div>
      </Card>
    </div>
  );

  // 隐私安全面板
  const PrivacySettingsPanel = () => (
    <div className="space-y-6">
      <Card title="数据管理" size="small">
        <div className="space-y-3">
          <Button size="small" type="text" block>
            导出游戏数据
          </Button>
          <Button size="small" type="text" block>
            清除缓存数据
          </Button>
          <Button 
            size="small" 
            type="text" 
            danger 
            block
            onClick={() => setIsResetModalOpen(true)}
          >
            重置所有设置
          </Button>
        </div>
      </Card>

      <Card title="隐私信息" size="small">
        <div className="text-sm text-gray-600 space-y-2">
          <p>本游戏仅在本地存储游戏数据，不会上传个人信息。</p>
          <p>音频设置和游戏偏好存储在浏览器本地存储中。</p>
          <p>您可以随时清除这些数据。</p>
        </div>
      </Card>
    </div>
  );

  // 帮助支持面板
  const HelpSettingsPanel = () => (
    <div className="space-y-6">
      <Card title="游戏信息" size="small">
        <div className="text-sm text-gray-600 space-y-2">
          <div>游戏版本: v1.0.0</div>
          <div>构建时间: {new Date().toLocaleDateString()}</div>
          <div>浏览器: {navigator.userAgent.split(' ')[0]}</div>
        </div>
      </Card>

      <Card title="帮助链接" size="small">
        <div className="space-y-3">
          <Button size="small" type="text" block>
            游戏教程
          </Button>
          <Button size="small" type="text" block>
            常见问题
          </Button>
          <Button size="small" type="text" block>
            联系客服
          </Button>
          <Button size="small" type="text" block>
            用户反馈
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettingsPanel />;
      case 'audio':
        return <AudioSettingsPanel />;
      case 'interface':
        return <InterfaceSettingsPanel />;
      case 'notifications':
        return <NotificationSettingsPanel />;
      case 'privacy':
        return <PrivacySettingsPanel />;
      case 'help':
        return <HelpSettingsPanel />;
      default:
        return <GeneralSettingsPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <motion.div
        className="bg-white shadow-sm border-b px-4 py-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <AudioButton
            variant="ghost"
            size="small"
            onClick={() => navigate(-1)}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            返回
          </AudioButton>
          <h1 className="text-xl font-bold text-gray-800">游戏设置</h1>
        </div>
      </motion.div>

      <div className="flex">
        {/* 侧边栏标签 */}
        <motion.div
          className={`
            ${screen.isMobile ? 'w-20' : 'w-64'} 
            bg-white shadow-sm border-r min-h-screen
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4">
            <div className="space-y-2">
              {settingsTabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                    transition-colors duration-200
                    ${activeTab === tab.key
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.icon}
                  {!screen.isMobile && <span>{tab.label}</span>}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 主内容区域 */}
        <motion.div
          className="flex-1 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-2xl mx-auto">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>

      {/* 重置确认模态框 */}
      <Modal
        title="重置设置"
        open={isResetModalOpen}
        onOk={handleResetSettings}
        onCancel={() => setIsResetModalOpen(false)}
        okText="确认重置"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要重置所有设置到默认值吗？</p>
        <p className="text-sm text-gray-500 mt-2">
          这将清除所有自定义设置，包括音频配置、界面偏好等。
        </p>
      </Modal>
    </div>
  );
};

export default SettingsPage;