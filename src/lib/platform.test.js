import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectDesktopOS } from './platform';

function stubNavigator(userAgent, platform = '') {
  vi.stubGlobal('navigator', { userAgent, platform });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectDesktopOS', () => {
  it('detects Windows', () => {
    stubNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32');
    expect(detectDesktopOS()).toBe('windows');
  });

  it('detects macOS', () => {
    stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel');
    expect(detectDesktopOS()).toBe('macos');
  });

  it('detects Linux', () => {
    stubNavigator('Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64');
    expect(detectDesktopOS()).toBe('linux');
  });

  it('returns null for Android, so no desktop installer is ever suggested', () => {
    stubNavigator('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l');
    expect(detectDesktopOS()).toBeNull();
  });

  it('returns null for iOS', () => {
    stubNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone');
    expect(detectDesktopOS()).toBeNull();
  });
});
