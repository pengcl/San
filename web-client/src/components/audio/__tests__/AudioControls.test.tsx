/**
 * AudioControls组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioControls from '../AudioControls';
import GameAudioService from '../../../services/audio/gameAudio';

// Mock GameAudioService
jest.mock('../../../services/audio/gameAudio', () => ({
  __esModule: true,
  default: {
    getConfig: jest.fn(() => ({
      volume: 0.7,
      muted: false,
      enableSFX: true,
      enableMusic: true,
    })),
    setVolume: jest.fn(),
    setMuted: jest.fn(),
    setSFXEnabled: jest.fn(),
    setMusicEnabled: jest.fn(),
    initialize: jest.fn(),
    getAudioContextState: jest.fn(() => 'running'),
    playUIInteraction: jest.fn(),
    toggleMusic: jest.fn(),
  },
}));

// Mock Ant Design components
jest.mock('antd', () => ({
  Slider: ({ value, onChange, disabled, ...props }: any) => (
    <input
      data-testid="volume-slider"
      type="range"
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      disabled={disabled}
      {...props}
    />
  ),
  Switch: ({ checked, onChange, ...props }: any) => (
    <input
      data-testid="audio-switch"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      {...props}
    />
  ),
  Popover: ({ children, content, open }: any) => (
    <div>
      {children}
      {open && <div data-testid="popover-content">{content}</div>}
    </div>
  ),
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Divider: () => <hr data-testid="divider" />,
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  SpeakerWaveIcon: ({ className }: any) => (
    <span data-testid="speaker-wave-icon" className={className}>🔊</span>
  ),
  SpeakerXMarkIcon: ({ className }: any) => (
    <span data-testid="speaker-x-mark-icon" className={className}>🔇</span>
  ),
  MusicalNoteIcon: ({ className }: any) => (
    <span data-testid="musical-note-icon" className={className}>🎵</span>
  ),
  SpeakerArrowUpIcon: ({ className }: any) => (
    <span data-testid="speaker-arrow-up-icon" className={className}>🔉</span>
  ),
}));

// Mock SettingOutlined from Ant Design
jest.mock('@ant-design/icons', () => ({
  SettingOutlined: ({ className }: any) => (
    <span data-testid="setting-icon" className={className}>⚙️</span>
  ),
}));

describe('AudioControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Compact variant', () => {
    it('renders compact controls correctly', () => {
      render(<AudioControls variant="compact" />);

      expect(screen.getByTestId('speaker-wave-icon')).toBeInTheDocument();
      expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
      expect(screen.getByTestId('setting-icon')).toBeInTheDocument();
    });

    it('shows mute icon when muted', () => {
      (GameAudioService.getConfig as jest.Mock).mockReturnValue({
        volume: 0.7,
        muted: true,
        enableSFX: true,
        enableMusic: true,
      });

      render(<AudioControls variant="compact" />);
      expect(screen.getByTestId('speaker-x-mark-icon')).toBeInTheDocument();
    });

    it('handles mute toggle', async () => {
      render(<AudioControls variant="compact" />);

      const muteButton = screen.getByTestId('speaker-wave-icon').closest('button')!;
      fireEvent.click(muteButton);

      await waitFor(() => {
        expect(GameAudioService.setMuted).toHaveBeenCalledWith(true);
      });
    });

    it('handles volume change', async () => {
      render(<AudioControls variant="compact" />);

      const volumeSlider = screen.getByTestId('volume-slider');
      fireEvent.change(volumeSlider, { target: { value: '50' } });

      await waitFor(() => {
        expect(GameAudioService.setVolume).toHaveBeenCalledWith(0.5);
      });
    });
  });

  describe('Full variant', () => {
    it('renders full controls correctly', () => {
      render(<AudioControls variant="full" showLabels={true} />);

      expect(screen.getByText('音量')).toBeInTheDocument();
      expect(screen.getByText('音效')).toBeInTheDocument();
      expect(screen.getByText('背景音乐')).toBeInTheDocument();
      expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
    });

    it('renders without labels when showLabels is false', () => {
      render(<AudioControls variant="full" showLabels={false} />);

      expect(screen.queryByText('音量')).not.toBeInTheDocument();
      expect(screen.queryByText('音效')).not.toBeInTheDocument();
      expect(screen.queryByText('背景音乐')).not.toBeInTheDocument();
    });

    it('applies vertical orientation correctly', () => {
      const { container } = render(
        <AudioControls variant="full" orientation="vertical" />
      );

      const controlsContainer = container.firstChild as HTMLElement;
      expect(controlsContainer).toHaveClass('flex-col');
    });
  });

  describe('Panel variant', () => {
    it('renders panel controls correctly', () => {
      render(<AudioControls variant="panel" />);

      expect(screen.getByText('音频设置')).toBeInTheDocument();
      expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
    });
  });

  describe('Audio state management', () => {
    it('initializes with correct audio config', () => {
      render(<AudioControls variant="compact" />);

      expect(GameAudioService.getConfig).toHaveBeenCalled();
      expect(GameAudioService.initialize).toHaveBeenCalled();
    });

    it('handles SFX toggle correctly', async () => {
      render(<AudioControls variant="full" />);

      // Find SFX switches (there might be multiple)
      const switches = screen.getAllByTestId('audio-switch');
      const sfxSwitch = switches[0]; // Assuming first switch is SFX

      fireEvent.change(sfxSwitch, { target: { checked: false } });

      await waitFor(() => {
        expect(GameAudioService.setSFXEnabled).toHaveBeenCalledWith(false);
      });
    });

    it('handles music toggle correctly', async () => {
      render(<AudioControls variant="full" />);

      // Find music switches
      const switches = screen.getAllByTestId('audio-switch');
      const musicSwitch = switches[1]; // Assuming second switch is music

      fireEvent.change(musicSwitch, { target: { checked: false } });

      await waitFor(() => {
        expect(GameAudioService.setMusicEnabled).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Audio context state', () => {
    it('displays audio context state when available', () => {
      (GameAudioService.getAudioContextState as jest.Mock).mockReturnValue('suspended');

      render(<AudioControls variant="panel" />);

      expect(screen.getByText(/音频状态: suspended/)).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <AudioControls variant="compact" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Disabled states', () => {
    it('disables volume slider when muted', () => {
      (GameAudioService.getConfig as jest.Mock).mockReturnValue({
        volume: 0.7,
        muted: true,
        enableSFX: true,
        enableMusic: true,
      });

      render(<AudioControls variant="compact" />);

      const volumeSlider = screen.getByTestId('volume-slider');
      expect(volumeSlider).toBeDisabled();
    });
  });

  describe('Test buttons', () => {
    it('plays test SFX when button is clicked', async () => {
      render(<AudioControls variant="panel" />);

      const testButton = screen.getByText('测试音效');
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(GameAudioService.playUIInteraction).toHaveBeenCalledWith('click');
      });
    });

    it('toggles music when test music button is clicked', async () => {
      render(<AudioControls variant="panel" />);

      const testMusicButton = screen.getByText('播放/暂停');
      fireEvent.click(testMusicButton);

      await waitFor(() => {
        expect(GameAudioService.toggleMusic).toHaveBeenCalled();
      });
    });
  });
});