import { renderHook, act, waitFor } from '@testing-library/react';
import {
  usePWA,
  usePWAInstall,
  usePWAUpdate,
  usePWANotifications,
} from '../usePWA';
import { pwaService } from '../../services/pwaService';

// Mock PWA service
jest.mock('../../services/pwaService', () => ({
  pwaService: {
    init: jest.fn(),
    isSupported: jest.fn(),
    isInstalled: jest.fn(),
    canInstall: jest.fn(),
    isOnline: jest.fn(),
    getCacheSize: jest.fn(),
    getInstallationStatus: jest.fn(),
    promptInstall: jest.fn(),
    skipWaiting: jest.fn(),
    showNotification: jest.fn(),
    requestNotificationPermission: jest.fn(),
    subscribePushNotification: jest.fn(),
    unsubscribePushNotification: jest.fn(),
    backgroundSync: jest.fn(),
    cleanCache: jest.fn(),
    onNetworkChange: jest.fn(),
  },
}));

const mockPWAService = pwaService as jest.Mocked<typeof pwaService>;

describe('usePWA', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockPWAService.isSupported.mockReturnValue(true);
    mockPWAService.isInstalled.mockReturnValue(false);
    mockPWAService.canInstall.mockReturnValue(true);
    mockPWAService.isOnline.mockReturnValue(true);
    mockPWAService.getCacheSize.mockResolvedValue(1024000);
    mockPWAService.getInstallationStatus.mockReturnValue({
      isSupported: true,
      isInstalled: false,
      canInstall: true,
      updateAvailable: false,
    });
    mockPWAService.onNetworkChange.mockReturnValue(() => {});
  });

  it('should initialize with correct default state', async () => {
    const { result } = renderHook(() => usePWA());

    await waitFor(() => {
      const [state] = result.current;
      expect(state.isSupported).toBe(true);
      expect(state.isInstalled).toBe(false);
      expect(state.canInstall).toBe(true);
      expect(state.isOnline).toBe(true);
    });

    expect(mockPWAService.init).toHaveBeenCalled();
  });

  it('should handle install action', async () => {
    mockPWAService.promptInstall.mockResolvedValue('accepted');

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;
      const installResult = await actions.install();
      expect(installResult).toBe('accepted');
    });

    expect(mockPWAService.promptInstall).toHaveBeenCalled();
  });

  it('should handle update action', async () => {
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;
      await actions.update();
    });

    expect(mockPWAService.skipWaiting).toHaveBeenCalled();
  });

  it('should handle notification actions', async () => {
    mockPWAService.showNotification.mockResolvedValue(true);
    mockPWAService.requestNotificationPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;

      const showResult = await actions.showNotification({
        title: 'Test Notification',
        body: 'Test body',
      });
      expect(showResult).toBe(true);

      const permissionResult = await actions.requestNotificationPermission();
      expect(permissionResult).toBe('granted');
    });

    expect(mockPWAService.showNotification).toHaveBeenCalledWith({
      title: 'Test Notification',
      body: 'Test body',
    });
    expect(mockPWAService.requestNotificationPermission).toHaveBeenCalled();
  });

  it('should handle push notification subscription', async () => {
    const mockSubscription = { endpoint: 'test-endpoint' };
    mockPWAService.subscribePushNotification.mockResolvedValue(
      mockSubscription as any
    );
    mockPWAService.unsubscribePushNotification.mockResolvedValue(true);

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;

      const subscription = await actions.subscribePushNotification();
      expect(subscription).toEqual(mockSubscription);

      const unsubscribeResult = await actions.unsubscribePushNotification();
      expect(unsubscribeResult).toBe(true);
    });

    expect(mockPWAService.subscribePushNotification).toHaveBeenCalled();
    expect(mockPWAService.unsubscribePushNotification).toHaveBeenCalled();
  });

  it('should handle background sync', async () => {
    mockPWAService.backgroundSync.mockResolvedValue(true);

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;
      const syncResult = await actions.backgroundSync('test-tag', {
        data: 'test',
      });
      expect(syncResult).toBe(true);
    });

    expect(mockPWAService.backgroundSync).toHaveBeenCalledWith('test-tag', {
      data: 'test',
    });
  });

  it('should handle cache cleaning', async () => {
    mockPWAService.getCacheSize
      .mockResolvedValueOnce(2048000)
      .mockResolvedValueOnce(1024000);

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;
      await actions.cleanCache();
    });

    expect(mockPWAService.cleanCache).toHaveBeenCalled();
    expect(mockPWAService.getCacheSize).toHaveBeenCalledTimes(2); // Once on init, once after cleaning
  });

  it('should listen to PWA events', async () => {
    const { result } = renderHook(() => usePWA());

    // Simulate install available event
    act(() => {
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state.canInstall).toBe(true);
    });

    // Simulate update available event
    act(() => {
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state.updateAvailable).toBe(true);
    });

    // Simulate app installed event
    act(() => {
      window.dispatchEvent(new CustomEvent('appinstalled'));
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state.isInstalled).toBe(true);
    });
  });

  it('should listen to network changes', async () => {
    let networkCallback: (online: boolean) => void = () => {};
    mockPWAService.onNetworkChange.mockImplementation(callback => {
      networkCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => usePWA());

    // Simulate network change
    act(() => {
      networkCallback(false);
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state.isOnline).toBe(false);
    });
  });
});

describe('usePWAInstall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPWAService.getInstallationStatus.mockReturnValue({
      isSupported: true,
      isInstalled: false,
      canInstall: true,
      updateAvailable: false,
    });
  });

  it('should provide install functionality', async () => {
    mockPWAService.promptInstall.mockResolvedValue('accepted');

    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      const installResult = await result.current.install();
      expect(installResult).toBe('accepted');
    });

    expect(result.current.canInstall).toBe(true);
    expect(result.current.isInstalled).toBe(false);
  });
});

describe('usePWAUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPWAService.getInstallationStatus.mockReturnValue({
      isSupported: true,
      isInstalled: true,
      canInstall: false,
      updateAvailable: true,
    });
  });

  it('should provide update functionality', async () => {
    const { result } = renderHook(() => usePWAUpdate());

    await act(async () => {
      await result.current.update();
    });

    expect(mockPWAService.skipWaiting).toHaveBeenCalled();
    expect(result.current.updateAvailable).toBe(true);
  });
});

describe('usePWANotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Notification API
    Object.defineProperty(global, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: jest.fn().mockResolvedValue('granted'),
      },
      writable: true,
    });
  });

  it('should provide notification functionality', async () => {
    mockPWAService.requestNotificationPermission.mockResolvedValue('granted');
    mockPWAService.showNotification.mockResolvedValue(true);

    const { result } = renderHook(() => usePWANotifications());

    await act(async () => {
      const permission = await result.current.requestPermission();
      expect(permission).toBe('granted');
    });

    await act(async () => {
      const showResult = await result.current.showNotification({
        title: 'Test',
      });
      expect(showResult).toBe(true);
    });

    expect(result.current.canShowNotifications).toBe(true);
  });

  it('should handle notification permission states', () => {
    Object.defineProperty(global.Notification, 'permission', {
      value: 'denied',
      writable: true,
    });

    const { result } = renderHook(() => usePWANotifications());

    expect(result.current.permission).toBe('denied');
    expect(result.current.canShowNotifications).toBe(false);
  });
});

describe('Error handling', () => {
  it('should handle PWA service errors gracefully', async () => {
    mockPWAService.promptInstall.mockRejectedValue(new Error('Install failed'));

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const [, actions] = result.current;
      const installResult = await actions.install();
      expect(installResult).toBe('dismissed'); // Should fallback to dismissed on error
    });
  });

  it('should handle unsupported environments', () => {
    mockPWAService.isSupported.mockReturnValue(false);
    mockPWAService.getInstallationStatus.mockReturnValue({
      isSupported: false,
      isInstalled: false,
      canInstall: false,
      updateAvailable: false,
    });

    const { result } = renderHook(() => usePWA());

    const [state] = result.current;
    expect(state.isSupported).toBe(false);
    expect(state.canInstall).toBe(false);
  });

  it('should cleanup event listeners on unmount', () => {
    const cleanup = jest.fn();
    mockPWAService.onNetworkChange.mockReturnValue(cleanup);

    const { unmount } = renderHook(() => usePWA());

    unmount();

    expect(cleanup).toHaveBeenCalled();
  });
});
