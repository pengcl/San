/**
 * AudioManager 测试
 */

import AudioManager from '../AudioManager';

// Mock Web Audio API
const mockAudioContext = {
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  state: 'running',
  resume: jest.fn(),
  close: jest.fn(),
};

const mockHTMLAudioElement = {
  play: jest.fn(),
  pause: jest.fn(),
  cloneNode: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 0.5,
  loop: false,
  paused: false,
  currentTime: 0,
  preload: 'auto',
  canPlayType: jest.fn(() => 'probably'),
};

// Mock global objects
global.AudioContext = jest.fn(() => mockAudioContext) as any;
global.Audio = jest.fn(() => mockHTMLAudioElement) as any;

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (AudioManager as any).instance = undefined;
    audioManager = AudioManager.getInstance();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  describe('Singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration management', () => {
    it('loads default configuration', () => {
      const config = audioManager.getConfig();
      
      expect(config).toMatchObject({
        volume: 0.7,
        muted: false,
        enableSFX: true,
        enableMusic: true,
      });
    });

    it('saves configuration to localStorage', () => {
      audioManager.setVolume(0.5);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'gameAudioConfig',
        expect.stringContaining('"volume":0.5')
      );
    });

    it('loads configuration from localStorage', () => {
      const savedConfig = {
        volume: 0.8,
        muted: true,
        enableSFX: false,
        enableMusic: false,
      };
      
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(savedConfig));
      
      // Create new instance to test loading
      (AudioManager as any).instance = undefined;
      const newManager = AudioManager.getInstance();
      const config = newManager.getConfig();
      
      expect(config).toMatchObject(savedConfig);
      
      newManager.destroy();
    });
  });

  describe('Volume control', () => {
    it('sets volume within valid range', () => {
      audioManager.setVolume(0.5);
      expect(audioManager.getConfig().volume).toBe(0.5);
      
      audioManager.setVolume(-0.1);
      expect(audioManager.getConfig().volume).toBe(0);
      
      audioManager.setVolume(1.1);
      expect(audioManager.getConfig().volume).toBe(1);
    });

    it('updates mute state', () => {
      audioManager.setMuted(true);
      expect(audioManager.getConfig().muted).toBe(true);
      
      audioManager.setMuted(false);
      expect(audioManager.getConfig().muted).toBe(false);
    });
  });

  describe('Audio context management', () => {
    it('initializes audio context', () => {
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3); // main, music, sfx
    });

    it('resumes audio context when suspended', async () => {
      mockAudioContext.state = 'suspended';
      
      await audioManager.resumeAudioContext();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('returns audio context state', () => {
      const state = audioManager.getAudioContextState();
      expect(state).toBe('running');
    });
  });

  describe('Sound effects', () => {
    it('preloads sound effects', async () => {
      const soundEffects = [
        {
          id: 'test_sound',
          src: '/audio/test.mp3',
          volume: 0.5,
        },
      ];

      // Mock successful audio loading
      (mockHTMLAudioElement.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      await audioManager.preloadSoundEffects(soundEffects);

      expect(global.Audio).toHaveBeenCalledWith('/audio/test.mp3');
    });

    it('plays sound effects', async () => {
      const soundEffects = [
        {
          id: 'test_sound',
          src: '/audio/test.mp3',
        },
      ];

      // Setup preloaded sound
      (mockHTMLAudioElement.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );

      await audioManager.preloadSoundEffects(soundEffects);
      
      // Mock play method to return resolved promise
      mockHTMLAudioElement.play.mockResolvedValue(undefined);
      
      const result = await audioManager.playSFX('test_sound');

      expect(mockHTMLAudioElement.play).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('does not play SFX when disabled', async () => {
      audioManager.setSFXEnabled(false);
      
      const result = await audioManager.playSFX('test_sound');
      
      expect(result).toBeNull();
      expect(mockHTMLAudioElement.play).not.toHaveBeenCalled();
    });

    it('does not play SFX when muted', async () => {
      audioManager.setMuted(true);
      
      const result = await audioManager.playSFX('test_sound');
      
      expect(result).toBeNull();
      expect(mockHTMLAudioElement.play).not.toHaveBeenCalled();
    });
  });

  describe('Background music', () => {
    it('plays background music', async () => {
      // Mock successful audio loading and playing
      (mockHTMLAudioElement.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );
      mockHTMLAudioElement.play.mockResolvedValue(undefined);

      const result = await audioManager.playMusic('/audio/music.mp3');

      expect(global.Audio).toHaveBeenCalledWith('/audio/music.mp3');
      expect(mockHTMLAudioElement.play).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('stops current music before playing new music', async () => {
      // Setup existing music
      (mockHTMLAudioElement.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          if (event === 'canplaythrough') {
            setTimeout(callback, 0);
          }
        }
      );
      mockHTMLAudioElement.play.mockResolvedValue(undefined);

      await audioManager.playMusic('/audio/music1.mp3');
      await audioManager.playMusic('/audio/music2.mp3');

      expect(mockHTMLAudioElement.pause).toHaveBeenCalled();
    });

    it('does not play music when disabled', async () => {
      audioManager.setMusicEnabled(false);
      
      const result = await audioManager.playMusic('/audio/music.mp3');
      
      expect(result).toBeNull();
      expect(mockHTMLAudioElement.play).not.toHaveBeenCalled();
    });

    it('toggles music playback', () => {
      // Mock current music
      (audioManager as any).currentMusic = mockHTMLAudioElement;
      mockHTMLAudioElement.paused = true;
      mockHTMLAudioElement.play.mockResolvedValue(undefined);

      audioManager.toggleMusic();

      expect(mockHTMLAudioElement.play).toHaveBeenCalled();
    });
  });

  describe('Audio format support', () => {
    it('checks audio format support', () => {
      mockHTMLAudioElement.canPlayType.mockReturnValue('probably');
      
      const canPlay = AudioManager.canPlayType('audio/mp3');
      
      expect(canPlay).toBe(true);
      expect(mockHTMLAudioElement.canPlayType).toHaveBeenCalledWith('audio/mp3');
    });

    it('returns false for unsupported formats', () => {
      mockHTMLAudioElement.canPlayType.mockReturnValue('');
      
      const canPlay = AudioManager.canPlayType('audio/unsupported');
      
      expect(canPlay).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('stops all audio on destroy', () => {
      audioManager.destroy();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('clears all resources on destroy', () => {
      audioManager.destroy();

      const config = audioManager.getConfig();
      expect(config).toBeDefined(); // Should still have default config
    });
  });

  describe('Error handling', () => {
    it('handles audio context creation failure gracefully', () => {
      // Mock AudioContext constructor to throw
      global.AudioContext = jest.fn(() => {
        throw new Error('AudioContext not supported');
      }) as any;

      // Create new instance
      (AudioManager as any).instance = undefined;
      const newManager = AudioManager.getInstance();

      expect(newManager).toBeDefined();
      expect(newManager.getAudioContextState()).toBe('not-supported');
      
      newManager.destroy();
    });

    it('handles sound loading failure gracefully', async () => {
      const soundEffects = [
        {
          id: 'broken_sound',
          src: '/audio/nonexistent.mp3',
        },
      ];

      // Mock failed audio loading
      (mockHTMLAudioElement.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Failed to load')), 0);
          }
        }
      );

      await audioManager.preloadSoundEffects(soundEffects);

      // Should not throw and should handle gracefully
      const result = await audioManager.playSFX('broken_sound');
      expect(result).toBeNull();
    });
  });
});