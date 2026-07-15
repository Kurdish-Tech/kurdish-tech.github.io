import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectPlatform } from './platform';

function stubNavigator(userAgent, platform = '') {
  vi.stubGlobal('navigator', { userAgent, platform });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectPlatform', () => {
  it('detects Windows', () => {
    stubNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32');
    expect(detectPlatform()).toBe('windows');
  });

  it('detects macOS', () => {
    stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel');
    expect(detectPlatform()).toBe('macos');
  });

  it('detects Linux', () => {
    stubNavigator('Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64');
    expect(detectPlatform()).toBe('linux');
  });

  it('detects Android (a Linux-based UA, but Android must win the match)', () => {
    stubNavigator('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l');
    expect(detectPlatform()).toBe('android');
  });

  it('returns null for iOS, since there is no iOS build to offer', () => {
    stubNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone');
    expect(detectPlatform()).toBeNull();
  });
});
