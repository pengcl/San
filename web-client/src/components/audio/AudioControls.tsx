/**
 * 音频控制组件
 * 提供音量、静音、音效开关等控制界面
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon as SpeakerArrowUpIcon, // 使用 SpeakerWaveIcon 作为替代
} from '@heroicons/react/24/outline';
import { Slider, Switch, Popover, Button, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import GameAudioService from '../../services/audio/gameAudio';
import type { AudioConfig } from '../../services/audio/AudioManager';

interface AudioControlsProps {
  className?: string;
  variant?: 'compact' | 'full' | 'panel';
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const AudioControls: React.FC<AudioControlsProps> = ({
  className = '',
  variant = 'compact',
  showLabels = true,
  orientation = 'horizontal',
}) => {
  const [config, setConfig] = useState<AudioConfig>({
    volume: 0.7,
    muted: false,
    enableSFX: true,
    enableMusic: true,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [audioContextState, setAudioContextState] = useState('');

  useEffect(() => {
    // 初始化音频配置
    const currentConfig = GameAudioService.getConfig();
    setConfig(currentConfig);
    setAudioContextState(GameAudioService.getAudioContextState());

    // 初始化音频系统
    GameAudioService.initialize();
  }, []);

  const handleVolumeChange = (volume: number) => {
    const newVolume = volume / 100;
    setConfig((prev) => ({ ...prev, volume: newVolume }));
    GameAudioService.setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    const newMuted = !config.muted;
    setConfig((prev) => ({ ...prev, muted: newMuted }));
    GameAudioService.setMuted(newMuted);
    
    // 播放反馈音效
    if (!newMuted) {
      GameAudioService.playUIInteraction('click');
    }
  };

  const handleSFXToggle = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enableSFX: enabled }));
    GameAudioService.setSFXEnabled(enabled);
    
    // 播放测试音效
    if (enabled) {
      GameAudioService.playUIInteraction('success');
    }
  };

  const handleMusicToggle = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enableMusic: enabled }));
    GameAudioService.setMusicEnabled(enabled);
  };

  const handleTestSFX = async () => {
    await GameAudioService.playUIInteraction('click');
  };

  const handleTestMusic = async () => {
    if (config.enableMusic) {
      GameAudioService.toggleMusic();
    }
  };

  // 紧凑模式 - 只显示主要控制
  const CompactControls = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMuteToggle}
        className={`
          p-2 rounded-lg transition-colors duration-200
          ${config.muted 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          }
        `}
        title={config.muted ? '取消静音' : '静音'}
      >
        {config.muted ? (
          <SpeakerXMarkIcon className="w-5 h-5" />
        ) : (
          <SpeakerWaveIcon className="w-5 h-5" />
        )}
      </motion.button>

      <div className="w-20">
        <Slider
          min={0}
          max={100}
          value={config.volume * 100}
          onChange={handleVolumeChange}
          disabled={config.muted}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
      </div>

      <Popover
        content={<FullControlPanel />}
        title="音频设置"
        trigger="click"
        placement="bottomRight"
        open={isVisible}
        onOpenChange={setIsVisible}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title="音频设置"
        >
          <SettingOutlined className="text-base" />
        </motion.button>
      </Popover>
    </div>
  );

  // 完整控制面板
  const FullControlPanel = () => (
    <div className="w-64 p-2">
      {/* 主音量控制 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">主音量</span>
          <span className="text-xs text-gray-500">{Math.round(config.volume * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMuteToggle}
            className={`
              p-1 rounded transition-colors
              ${config.muted ? 'text-red-500' : 'text-gray-600 hover:text-blue-600'}
            `}
          >
            {config.muted ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </button>
          <Slider
            min={0}
            max={100}
            value={config.volume * 100}
            onChange={handleVolumeChange}
            disabled={config.muted}
            className="flex-1"
          />
        </div>
      </div>

      <Divider className="my-3" />

      {/* 音效控制 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SpeakerArrowUpIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">音效</span>
          </div>
          <Switch
            size="small"
            checked={config.enableSFX}
            onChange={handleSFXToggle}
          />
        </div>
        <Button
          size="small"
          type="text"
          onClick={handleTestSFX}
          disabled={!config.enableSFX || config.muted}
          className="w-full text-xs"
        >
          测试音效
        </Button>
      </div>

      {/* 背景音乐控制 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MusicalNoteIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">背景音乐</span>
          </div>
          <Switch
            size="small"
            checked={config.enableMusic}
            onChange={handleMusicToggle}
          />
        </div>
        <Button
          size="small"
          type="text"
          onClick={handleTestMusic}
          disabled={!config.enableMusic || config.muted}
          className="w-full text-xs"
        >
          播放/暂停
        </Button>
      </div>

      {audioContextState && (
        <>
          <Divider className="my-3" />
          <div className="text-xs text-gray-500">
            音频状态: {audioContextState}
          </div>
        </>
      )}
    </div>
  );

  // 面板模式 - 完整的控制面板
  const PanelControls = () => (
    <div className={`bg-white rounded-lg shadow-lg border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">音频设置</h3>
      </div>
      
      <FullControlPanel />
    </div>
  );

  // 完整模式 - 所有控制都可见
  const FullControls = () => (
    <div className={`
      ${orientation === 'vertical' ? 'flex flex-col gap-4' : 'flex items-center gap-6'}
      ${className}
    `}>
      {/* 主音量 */}
      <div className={`
        flex items-center gap-3
        ${orientation === 'vertical' ? 'flex-col items-start' : ''}
      `}>
        {showLabels && (
          <span className="text-sm font-medium text-gray-700 min-w-max">
            音量
          </span>
        )}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMuteToggle}
            className={`
              p-2 rounded-lg transition-colors
              ${config.muted 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }
            `}
          >
            {config.muted ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </motion.button>
          <div className="w-24">
            <Slider
              min={0}
              max={100}
              value={config.volume * 100}
              onChange={handleVolumeChange}
              disabled={config.muted}
            />
          </div>
        </div>
      </div>

      {/* 音效开关 */}
      <div className={`
        flex items-center gap-3
        ${orientation === 'vertical' ? 'flex-col items-start' : ''}
      `}>
        {showLabels && (
          <span className="text-sm font-medium text-gray-700 min-w-max">
            音效
          </span>
        )}
        <Switch
          checked={config.enableSFX}
          onChange={handleSFXToggle}
          checkedChildren="开"
          unCheckedChildren="关"
        />
      </div>

      {/* 背景音乐开关 */}
      <div className={`
        flex items-center gap-3
        ${orientation === 'vertical' ? 'flex-col items-start' : ''}
      `}>
        {showLabels && (
          <span className="text-sm font-medium text-gray-700 min-w-max">
            背景音乐
          </span>
        )}
        <Switch
          checked={config.enableMusic}
          onChange={handleMusicToggle}
          checkedChildren="开"
          unCheckedChildren="关"
        />
      </div>
    </div>
  );

  // 根据变体渲染不同的控制界面
  switch (variant) {
    case 'compact':
      return <CompactControls />;
    case 'panel':
      return <PanelControls />;
    case 'full':
      return <FullControls />;
    default:
      return <CompactControls />;
  }
};

export default AudioControls;