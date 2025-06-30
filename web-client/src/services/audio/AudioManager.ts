/**
 * 音频管理器
 * 负责游戏音效和背景音乐的播放控制
 */

export interface AudioConfig {
  volume: number;
  muted: boolean;
  enableSFX: boolean;
  enableMusic: boolean;
}

export interface SoundEffect {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

export interface AudioOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  delay?: number;
}

class AudioManager {
  private static instance: AudioManager;
  private config: AudioConfig = {
    volume: 0.7,
    muted: false,
    enableSFX: true,
    enableMusic: true,
  };

  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private musicQueue: string[] = [];

  private fadeTimeouts: Map<string, number> = new Map();
  private isInitialized = false;

  private constructor() {
    this.loadConfig();
    this.initializeAudioContext();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 初始化音频上下文
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // 创建Web Audio API上下文
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // 创建增益节点用于音量控制
      this.gainNode = this.audioContext.createGain();
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();

      // 连接节点
      this.musicGainNode.connect(this.gainNode);
      this.sfxGainNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // 设置初始音量
      this.updateVolume();

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize AudioContext:', error);
      // 降级到HTML5 Audio API
      this.isInitialized = true;
    }
  }

  /**
   * 用户交互后恢复音频上下文
   */
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * 预加载音效文件
   */
  async preloadSoundEffects(effects: SoundEffect[]): Promise<void> {
    const loadPromises = effects.map(async (effect) => {
      try {
        const audio = new Audio(effect.src);
        audio.volume = effect.volume ?? this.config.volume;
        audio.loop = effect.loop ?? false;
        audio.preload = 'auto';

        // 等待音频加载完成
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(), {
            once: true,
          });
          audio.addEventListener('error', reject, { once: true });
        });

        this.soundEffects.set(effect.id, audio);
      } catch (error) {
        console.warn(`Failed to load sound effect: ${effect.id}`, error);
      }
    });

    await Promise.allSettled(loadPromises);
  }

  /**
   * 播放音效
   */
  async playSFX(
    soundId: string,
    options: AudioOptions = {}
  ): Promise<HTMLAudioElement | null> {
    if (!this.config.enableSFX || this.config.muted) {
      return null;
    }

    await this.resumeAudioContext();

    let audio = this.soundEffects.get(soundId);
    if (!audio) {
      console.warn(`Sound effect not found: ${soundId}`);
      return null;
    }

    try {
      // 如果音频正在播放，创建新实例避免中断
      if (!audio.paused) {
        audio = audio.cloneNode() as HTMLAudioElement;
      }

      // 设置音量
      const volume = (options.volume ?? this.config.volume) * 0.8; // SFX稍微降低音量
      audio.volume = Math.max(0, Math.min(1, volume));

      // 设置循环
      audio.loop = options.loop ?? false;

      // 延迟播放
      if (options.delay) {
        setTimeout(() => {
          this.playAudioWithFade(audio!, options);
        }, options.delay);
      } else {
        await this.playAudioWithFade(audio, options);
      }

      return audio;
    } catch (error) {
      console.warn(`Failed to play sound effect: ${soundId}`, error);
      return null;
    }
  }

  /**
   * 播放背景音乐
   */
  async playMusic(
    musicSrc: string,
    options: AudioOptions = {}
  ): Promise<HTMLAudioElement | null> {
    if (!this.config.enableMusic || this.config.muted) {
      return null;
    }

    await this.resumeAudioContext();

    try {
      // 停止当前音乐
      if (this.currentMusic) {
        await this.stopMusic(options.fadeOut);
      }

      // 创建新的音频元素
      const music = new Audio(musicSrc);
      music.volume = options.volume ?? this.config.volume;
      music.loop = options.loop ?? true;
      music.preload = 'auto';

      // 等待音频加载
      await new Promise<void>((resolve, reject) => {
        music.addEventListener('canplaythrough', () => resolve(), {
          once: true,
        });
        music.addEventListener('error', reject, { once: true });
      });

      this.currentMusic = music;

      // 播放音乐（带淡入效果）
      await this.playAudioWithFade(music, options);

      return music;
    } catch (error) {
      console.warn(`Failed to play music: ${musicSrc}`, error);
      return null;
    }
  }

  /**
   * 停止背景音乐
   */
  async stopMusic(fadeOutDuration = 1000): Promise<void> {
    if (!this.currentMusic) return;

    try {
      if (fadeOutDuration > 0) {
        await this.fadeOut(this.currentMusic, fadeOutDuration);
      }

      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    } catch (error) {
      console.warn('Failed to stop music:', error);
    }
  }

  /**
   * 暂停/恢复背景音乐
   */
  toggleMusic(): void {
    if (!this.currentMusic) return;

    if (this.currentMusic.paused) {
      this.currentMusic.play().catch((error) => {
        console.warn('Failed to resume music:', error);
      });
    } else {
      this.currentMusic.pause();
    }
  }

  /**
   * 播放音频并应用淡入效果
   */
  private async playAudioWithFade(
    audio: HTMLAudioElement,
    options: AudioOptions
  ): Promise<void> {
    try {
      if (options.fadeIn && options.fadeIn > 0) {
        audio.volume = 0;
        await audio.play();
        await this.fadeIn(audio, options.fadeIn, options.volume);
      } else {
        await audio.play();
      }
    } catch (error) {
      console.warn('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * 淡入效果
   */
  private async fadeIn(
    audio: HTMLAudioElement,
    duration: number,
    targetVolume?: number
  ): Promise<void> {
    const target = targetVolume ?? this.config.volume;
    const steps = 60; // 60fps
    const stepDuration = duration / steps;
    const volumeStep = target / steps;

    return new Promise((resolve) => {
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(volumeStep * currentStep, target);

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * 淡出效果
   */
  private async fadeOut(
    audio: HTMLAudioElement,
    duration: number
  ): Promise<void> {
    const initialVolume = audio.volume;
    const steps = 60;
    const stepDuration = duration / steps;
    const volumeStep = initialVolume / steps;

    return new Promise((resolve) => {
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(initialVolume - volumeStep * currentStep, 0);

        if (currentStep >= steps || audio.volume <= 0) {
          clearInterval(fadeInterval);
          audio.volume = 0;
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * 设置主音量
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
    this.saveConfig();
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.updateVolume();
    this.saveConfig();
  }

  /**
   * 启用/禁用音效
   */
  setSFXEnabled(enabled: boolean): void {
    this.config.enableSFX = enabled;
    if (!enabled) {
      this.stopAllSFX();
    }
    this.saveConfig();
  }

  /**
   * 启用/禁用背景音乐
   */
  setMusicEnabled(enabled: boolean): void {
    this.config.enableMusic = enabled;
    if (!enabled && this.currentMusic) {
      this.stopMusic();
    }
    this.saveConfig();
  }

  /**
   * 停止所有音效
   */
  stopAllSFX(): void {
    this.soundEffects.forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  /**
   * 停止所有音频
   */
  stopAll(): void {
    this.stopAllSFX();
    this.stopMusic();
  }

  /**
   * 更新音量设置
   */
  private updateVolume(): void {
    const effectiveVolume = this.config.muted ? 0 : this.config.volume;

    if (this.gainNode) {
      this.gainNode.gain.value = effectiveVolume;
    }

    // 更新当前播放的音乐音量
    if (this.currentMusic) {
      this.currentMusic.volume = effectiveVolume;
    }

    // 更新所有音效的音量
    this.soundEffects.forEach((audio) => {
      audio.volume = effectiveVolume * 0.8; // 音效稍微降低音量
    });
  }

  /**
   * 加载配置
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('gameAudioConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load audio config:', error);
    }
  }

  /**
   * 保存配置
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('gameAudioConfig', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save audio config:', error);
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * 获取音频上下文状态
   */
  getAudioContextState(): string {
    return this.audioContext?.state ?? 'not-supported';
  }

  /**
   * 检查是否支持音频格式
   */
  static canPlayType(type: string): boolean {
    const audio = new Audio();
    return audio.canPlayType(type) !== '';
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAll();

    this.soundEffects.clear();
    this.fadeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.fadeTimeouts.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.gainNode = null;
    this.musicGainNode = null;
    this.sfxGainNode = null;
    this.currentMusic = null;
    this.isInitialized = false;
  }
}

export default AudioManager;