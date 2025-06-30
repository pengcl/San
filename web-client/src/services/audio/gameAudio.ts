/**
 * 游戏音频配置和便捷方法
 */

import AudioManager, { type SoundEffect } from './AudioManager';

// 游戏音效定义
export const GAME_SOUNDS: Record<string, SoundEffect> = {
  // UI 音效
  BUTTON_CLICK: {
    id: 'button_click',
    src: '/audio/sfx/button_click.mp3',
    volume: 0.6,
  },
  BUTTON_HOVER: {
    id: 'button_hover',
    src: '/audio/sfx/button_hover.mp3',
    volume: 0.4,
  },
  MODAL_OPEN: {
    id: 'modal_open',
    src: '/audio/sfx/modal_open.mp3',
    volume: 0.5,
  },
  MODAL_CLOSE: {
    id: 'modal_close',
    src: '/audio/sfx/modal_close.mp3',
    volume: 0.5,
  },
  TAB_SWITCH: {
    id: 'tab_switch',
    src: '/audio/sfx/tab_switch.mp3',
    volume: 0.4,
  },
  NOTIFICATION: {
    id: 'notification',
    src: '/audio/sfx/notification.mp3',
    volume: 0.7,
  },
  ERROR: {
    id: 'error',
    src: '/audio/sfx/error.mp3',
    volume: 0.6,
  },
  SUCCESS: {
    id: 'success',
    src: '/audio/sfx/success.mp3',
    volume: 0.6,
  },

  // 卡牌音效
  CARD_FLIP: {
    id: 'card_flip',
    src: '/audio/sfx/card_flip.mp3',
    volume: 0.5,
  },
  CARD_SELECT: {
    id: 'card_select',
    src: '/audio/sfx/card_select.mp3',
    volume: 0.6,
  },
  CARD_DRAW: {
    id: 'card_draw',
    src: '/audio/sfx/card_draw.mp3',
    volume: 0.5,
  },
  CARD_PLACE: {
    id: 'card_place',
    src: '/audio/sfx/card_place.mp3',
    volume: 0.5,
  },

  // 战斗音效
  ATTACK_MELEE: {
    id: 'attack_melee',
    src: '/audio/sfx/attack_melee.mp3',
    volume: 0.7,
  },
  ATTACK_RANGED: {
    id: 'attack_ranged',
    src: '/audio/sfx/attack_ranged.mp3',
    volume: 0.7,
  },
  ATTACK_MAGIC: {
    id: 'attack_magic',
    src: '/audio/sfx/attack_magic.mp3',
    volume: 0.7,
  },
  SKILL_CAST: {
    id: 'skill_cast',
    src: '/audio/sfx/skill_cast.mp3',
    volume: 0.8,
  },
  DAMAGE_RECEIVED: {
    id: 'damage_received',
    src: '/audio/sfx/damage_received.mp3',
    volume: 0.6,
  },
  HEAL: {
    id: 'heal',
    src: '/audio/sfx/heal.mp3',
    volume: 0.6,
  },
  VICTORY: {
    id: 'victory',
    src: '/audio/sfx/victory.mp3',
    volume: 0.8,
  },
  DEFEAT: {
    id: 'defeat',
    src: '/audio/sfx/defeat.mp3',
    volume: 0.7,
  },

  // 金币和奖励音效
  COIN_EARN: {
    id: 'coin_earn',
    src: '/audio/sfx/coin_earn.mp3',
    volume: 0.6,
  },
  COIN_SPEND: {
    id: 'coin_spend',
    src: '/audio/sfx/coin_spend.mp3',
    volume: 0.5,
  },
  LEVEL_UP: {
    id: 'level_up',
    src: '/audio/sfx/level_up.mp3',
    volume: 0.8,
  },
  REWARD_RECEIVED: {
    id: 'reward_received',
    src: '/audio/sfx/reward_received.mp3',
    volume: 0.7,
  },

  // 环境音效
  FORGE_HAMMER: {
    id: 'forge_hammer',
    src: '/audio/sfx/forge_hammer.mp3',
    volume: 0.5,
  },
  SCROLL_UNFURL: {
    id: 'scroll_unfurl',
    src: '/audio/sfx/scroll_unfurl.mp3',
    volume: 0.4,
  },
  DOOR_OPEN: {
    id: 'door_open',
    src: '/audio/sfx/door_open.mp3',
    volume: 0.5,
  },
  FOOTSTEPS: {
    id: 'footsteps',
    src: '/audio/sfx/footsteps.mp3',
    volume: 0.3,
    loop: true,
  },
};

// 背景音乐定义
export const GAME_MUSIC = {
  MAIN_MENU: '/audio/music/main_menu.mp3',
  BATTLE: '/audio/music/battle.mp3',
  CITY: '/audio/music/city.mp3',
  VICTORY: '/audio/music/victory.mp3',
  DEFEAT: '/audio/music/defeat.mp3',
  TAVERN: '/audio/music/tavern.mp3',
  FOREST: '/audio/music/forest.mp3',
  MOUNTAIN: '/audio/music/mountain.mp3',
} as const;

// 音频管理器实例
const audioManager = AudioManager.getInstance();

/**
 * 游戏音频服务
 */
export class GameAudioService {
  private static isInitialized = false;

  /**
   * 初始化音频系统
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 预加载所有音效
      await audioManager.preloadSoundEffects(Object.values(GAME_SOUNDS));
      this.isInitialized = true;

      // 监听用户交互以恢复音频上下文
      this.setupUserInteractionListener();
    } catch (error) {
      console.warn('Failed to initialize game audio:', error);
    }
  }

  /**
   * 设置用户交互监听器
   */
  private static setupUserInteractionListener(): void {
    const resumeAudio = async () => {
      await audioManager.resumeAudioContext();
      // 移除监听器，只需要一次用户交互
      document.removeEventListener('click', resumeAudio, true);
      document.removeEventListener('keydown', resumeAudio, true);
      document.removeEventListener('touchstart', resumeAudio, true);
    };

    document.addEventListener('click', resumeAudio, true);
    document.addEventListener('keydown', resumeAudio, true);
    document.addEventListener('touchstart', resumeAudio, true);
  }

  // UI 音效方法
  static async playButtonClick(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.BUTTON_CLICK.id);
  }

  static async playButtonHover(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.BUTTON_HOVER.id);
  }

  static async playModalOpen(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.MODAL_OPEN.id, {
      fadeIn: 200,
    });
  }

  static async playModalClose(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.MODAL_CLOSE.id, {
      fadeOut: 200,
    });
  }

  static async playTabSwitch(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.TAB_SWITCH.id);
  }

  static async playNotification(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.NOTIFICATION.id);
  }

  static async playError(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.ERROR.id);
  }

  static async playSuccess(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.SUCCESS.id);
  }

  // 卡牌音效方法
  static async playCardFlip(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.CARD_FLIP.id, {
      volume: 0.4 + Math.random() * 0.2, // 添加音量变化
    });
  }

  static async playCardSelect(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.CARD_SELECT.id);
  }

  static async playCardDraw(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.CARD_DRAW.id);
  }

  static async playCardPlace(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.CARD_PLACE.id);
  }

  // 战斗音效方法
  static async playAttack(type: 'melee' | 'ranged' | 'magic' = 'melee'): Promise<void> {
    const soundMap = {
      melee: GAME_SOUNDS.ATTACK_MELEE.id,
      ranged: GAME_SOUNDS.ATTACK_RANGED.id,
      magic: GAME_SOUNDS.ATTACK_MAGIC.id,
    };

    await audioManager.playSFX(soundMap[type]);
  }

  static async playSkillCast(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.SKILL_CAST.id, {
      fadeIn: 100,
    });
  }

  static async playDamageReceived(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.DAMAGE_RECEIVED.id);
  }

  static async playHeal(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.HEAL.id);
  }

  static async playVictory(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.VICTORY.id, {
      fadeIn: 300,
    });
  }

  static async playDefeat(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.DEFEAT.id);
  }

  // 金币和奖励音效方法
  static async playCoinEarn(count = 1): Promise<void> {
    // 根据金币数量播放多次音效
    const playCount = Math.min(count, 5);
    for (let i = 0; i < playCount; i++) {
      setTimeout(() => {
        audioManager.playSFX(GAME_SOUNDS.COIN_EARN.id, {
          volume: 0.4 + Math.random() * 0.3,
        });
      }, i * 100);
    }
  }

  static async playCoinSpend(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.COIN_SPEND.id);
  }

  static async playLevelUp(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.LEVEL_UP.id, {
      fadeIn: 500,
    });
  }

  static async playRewardReceived(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.REWARD_RECEIVED.id);
  }

  // 环境音效方法
  static async playForgeHammer(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.FORGE_HAMMER.id);
  }

  static async playScrollUnfurl(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.SCROLL_UNFURL.id);
  }

  static async playDoorOpen(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.DOOR_OPEN.id);
  }

  static async startFootsteps(): Promise<void> {
    await audioManager.playSFX(GAME_SOUNDS.FOOTSTEPS.id, {
      loop: true,
      volume: 0.2,
    });
  }

  static stopFootsteps(): void {
    audioManager.stopAllSFX();
  }

  // 背景音乐方法
  static async playMainMenuMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.MAIN_MENU, {
      loop: true,
      fadeIn: 2000,
    });
  }

  static async playBattleMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.BATTLE, {
      loop: true,
      fadeIn: 1000,
    });
  }

  static async playCityMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.CITY, {
      loop: true,
      fadeIn: 2000,
    });
  }

  static async playVictoryMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.VICTORY, {
      loop: false,
      fadeIn: 500,
    });
  }

  static async playDefeatMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.DEFEAT, {
      loop: false,
      fadeIn: 500,
    });
  }

  static async playTavernMusic(): Promise<void> {
    await audioManager.playMusic(GAME_MUSIC.TAVERN, {
      loop: true,
      fadeIn: 1500,
    });
  }

  static async stopMusic(fadeOut = 1000): Promise<void> {
    await audioManager.stopMusic(fadeOut);
  }

  // 控制方法
  static setVolume(volume: number): void {
    audioManager.setVolume(volume);
  }

  static setMuted(muted: boolean): void {
    audioManager.setMuted(muted);
  }

  static setSFXEnabled(enabled: boolean): void {
    audioManager.setSFXEnabled(enabled);
  }

  static setMusicEnabled(enabled: boolean): void {
    audioManager.setMusicEnabled(enabled);
  }

  static toggleMusic(): void {
    audioManager.toggleMusic();
  }

  static getConfig() {
    return audioManager.getConfig();
  }

  static getAudioContextState(): string {
    return audioManager.getAudioContextState();
  }

  // 组合音效方法
  static async playUIInteraction(type: 'click' | 'hover' | 'success' | 'error'): Promise<void> {
    switch (type) {
      case 'click':
        await this.playButtonClick();
        break;
      case 'hover':
        await this.playButtonHover();
        break;
      case 'success':
        await this.playSuccess();
        break;
      case 'error':
        await this.playError();
        break;
    }
  }

  /**
   * 根据场景切换背景音乐
   */
  static async switchSceneMusic(scene: keyof typeof GAME_MUSIC): Promise<void> {
    const musicMap = {
      MAIN_MENU: this.playMainMenuMusic,
      BATTLE: this.playBattleMusic,
      CITY: this.playCityMusic,
      VICTORY: this.playVictoryMusic,
      DEFEAT: this.playDefeatMusic,
      TAVERN: this.playTavernMusic,
      FOREST: () => audioManager.playMusic(GAME_MUSIC.FOREST, { loop: true, fadeIn: 2000 }),
      MOUNTAIN: () => audioManager.playMusic(GAME_MUSIC.MOUNTAIN, { loop: true, fadeIn: 2000 }),
    };

    await musicMap[scene]?.();
  }

  /**
   * 清理资源
   */
  static destroy(): void {
    audioManager.destroy();
    this.isInitialized = false;
  }
}

// 导出单例实例
export default GameAudioService;