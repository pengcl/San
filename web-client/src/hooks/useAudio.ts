/**
 * 音频相关的React Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import GameAudioService from '../services/audio/gameAudio';
import type { AudioConfig } from '../services/audio/AudioManager';

/**
 * 音频配置Hook
 */
export const useAudioConfig = () => {
  const [config, setConfig] = useState<AudioConfig>({
    volume: 0.7,
    muted: false,
    enableSFX: true,
    enableMusic: true,
  });

  useEffect(() => {
    // 初始化配置
    const currentConfig = GameAudioService.getConfig();
    setConfig(currentConfig);
  }, []);

  const updateVolume = useCallback((volume: number) => {
    GameAudioService.setVolume(volume);
    setConfig((prev) => ({ ...prev, volume }));
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !config.muted;
    GameAudioService.setMuted(newMuted);
    setConfig((prev) => ({ ...prev, muted: newMuted }));
  }, [config.muted]);

  const toggleSFX = useCallback(() => {
    const newEnabled = !config.enableSFX;
    GameAudioService.setSFXEnabled(newEnabled);
    setConfig((prev) => ({ ...prev, enableSFX: newEnabled }));
  }, [config.enableSFX]);

  const toggleMusic = useCallback(() => {
    const newEnabled = !config.enableMusic;
    GameAudioService.setMusicEnabled(newEnabled);
    setConfig((prev) => ({ ...prev, enableMusic: newEnabled }));
  }, [config.enableMusic]);

  return {
    config,
    updateVolume,
    toggleMute,
    toggleSFX,
    toggleMusic,
  };
};

/**
 * 音效播放Hook
 */
export const useSoundEffect = () => {
  const playClick = useCallback(() => {
    GameAudioService.playUIInteraction('click');
  }, []);

  const playHover = useCallback(() => {
    GameAudioService.playUIInteraction('hover');
  }, []);

  const playSuccess = useCallback(() => {
    GameAudioService.playUIInteraction('success');
  }, []);

  const playError = useCallback(() => {
    GameAudioService.playUIInteraction('error');
  }, []);

  const playCardFlip = useCallback(() => {
    GameAudioService.playCardFlip();
  }, []);

  const playCardSelect = useCallback(() => {
    GameAudioService.playCardSelect();
  }, []);

  const playCoinEarn = useCallback((count = 1) => {
    GameAudioService.playCoinEarn(count);
  }, []);

  const playLevelUp = useCallback(() => {
    GameAudioService.playLevelUp();
  }, []);

  return {
    playClick,
    playHover,
    playSuccess,
    playError,
    playCardFlip,
    playCardSelect,
    playCoinEarn,
    playLevelUp,
  };
};

/**
 * 背景音乐Hook
 */
export const useBackgroundMusic = () => {
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playMusic = useCallback(async (musicType: string) => {
    try {
      await GameAudioService.switchSceneMusic(musicType as any);
      setCurrentMusic(musicType);
      setIsPlaying(true);
    } catch (error) {
      console.warn('Failed to play music:', error);
    }
  }, []);

  const stopMusic = useCallback(async () => {
    await GameAudioService.stopMusic();
    setCurrentMusic(null);
    setIsPlaying(false);
  }, []);

  const toggleMusic = useCallback(() => {
    GameAudioService.toggleMusic();
    setIsPlaying((prev) => !prev);
  }, []);

  return {
    currentMusic,
    isPlaying,
    playMusic,
    stopMusic,
    toggleMusic,
  };
};

/**
 * 音频反馈Hook - 为UI组件添加音频反馈
 */
export const useAudioFeedback = () => {
  const soundEffect = useSoundEffect();

  // 按钮点击反馈
  const withClickFeedback = useCallback(
    (handler?: () => void) => {
      return () => {
        soundEffect.playClick();
        handler?.();
      };
    },
    [soundEffect]
  );

  // 悬停反馈
  const withHoverFeedback = useCallback(
    (handler?: () => void) => {
      return () => {
        soundEffect.playHover();
        handler?.();
      };
    },
    [soundEffect]
  );

  // 成功反馈
  const withSuccessFeedback = useCallback(
    (handler?: () => void) => {
      return () => {
        soundEffect.playSuccess();
        handler?.();
      };
    },
    [soundEffect]
  );

  // 错误反馈
  const withErrorFeedback = useCallback(
    (handler?: () => void) => {
      return () => {
        soundEffect.playError();
        handler?.();
      };
    },
    [soundEffect]
  );

  return {
    withClickFeedback,
    withHoverFeedback,
    withSuccessFeedback,
    withErrorFeedback,
  };
};

/**
 * 音频初始化Hook
 */
export const useAudioInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioContextState, setAudioContextState] = useState('');
  const initializationRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;

      try {
        await GameAudioService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.warn('Audio initialization failed:', error);
        setIsInitialized(false);
      }
    };

    initialize();

    // 监听音频上下文状态变化
    const updateState = () => {
      setAudioContextState(GameAudioService.getAudioContextState());
    };

    updateState();
    const interval = setInterval(updateState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const resumeAudioContext = useCallback(async () => {
    try {
      await GameAudioService.initialize();
      setAudioContextState(GameAudioService.getAudioContextState());
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
    }
  }, []);

  return {
    isInitialized,
    audioContextState,
    resumeAudioContext,
  };
};

/**
 * 场景音乐Hook - 根据当前页面自动切换背景音乐
 */
export const useSceneMusic = (sceneName: string) => {
  const backgroundMusic = useBackgroundMusic();

  useEffect(() => {
    if (sceneName) {
      backgroundMusic.playMusic(sceneName);
    }

    return () => {
      // 组件卸载时不自动停止音乐，让其继续播放
    };
  }, [sceneName, backgroundMusic]);

  return backgroundMusic;
};

/**
 * 音量可视化Hook
 */
export const useVolumeVisualization = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const animationRef = useRef<number>();

  const startVisualization = useCallback(() => {
    const updateVolume = () => {
      // 模拟音量级别变化（实际项目中可以从AudioContext获取真实数据）
      const newLevel = Math.random() * 100;
      setVolumeLevel(newLevel);
      
      animationRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  }, []);

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setVolumeLevel(0);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    volumeLevel,
    startVisualization,
    stopVisualization,
  };
};

/**
 * 音频性能监控Hook
 */
export const useAudioPerformance = () => {
  const [metrics, setMetrics] = useState({
    audioContextState: '',
    activeSounds: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        audioContextState: GameAudioService.getAudioContextState(),
        activeSounds: 0, // 可以从AudioManager获取
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};