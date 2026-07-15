import { describe, it, expect } from 'vitest';
import { parseRelease } from './useAppReleases';

function asset(name, size = 1024) {
  return { name, size, browser_download_url: `https://example.com/${name}` };
}

describe('parseRelease', () => {
  it('matches each OS to its installer by file extension', () => {
    const release = {
      tag_name: 'app-v1.0.0',
      assets: [
        asset('Ferheng_1.0.0_x64-setup.exe'),
        asset('Ferheng_1.0.0_universal.dmg'),
        asset('ferheng_1.0.0_amd64.AppImage'),
        asset('ferheng_1.0.0_amd64.deb'),
        asset('Ferheng_1.0.0_universal.apk'),
      ],
    };
    const parsed = parseRelease(release);
    expect(parsed.version).toBe('v1.0.0');
    expect(parsed.windows.name).toBe('Ferheng_1.0.0_x64-setup.exe');
    expect(parsed.macos.name).toBe('Ferheng_1.0.0_universal.dmg');
    expect(parsed.linux.name).toBe('ferheng_1.0.0_amd64.AppImage');
    expect(parsed.android.name).toBe('Ferheng_1.0.0_universal.apk');
  });

  it('prefers .exe over .msi for Windows when both are present', () => {
    const release = {
      tag_name: 'app-v1.0.0',
      assets: [asset('Ferheng_1.0.0_x64_en-US.msi'), asset('Ferheng_1.0.0_x64-setup.exe')],
    };
    expect(parseRelease(release).windows.name).toBe('Ferheng_1.0.0_x64-setup.exe');
  });

  it('falls back to .deb for Linux when no AppImage is published', () => {
    const release = { tag_name: 'app-v1.0.0', assets: [asset('ferheng_1.0.0_amd64.deb')] };
    expect(parseRelease(release).linux.name).toBe('ferheng_1.0.0_amd64.deb');
  });

  it('leaves an OS unset when no matching asset exists', () => {
    const release = { tag_name: 'app-v1.0.0', assets: [asset('Ferheng_1.0.0_universal.dmg')] };
    const parsed = parseRelease(release);
    expect(parsed.macos).not.toBeNull();
    expect(parsed.windows).toBeNull();
    expect(parsed.linux).toBeNull();
  });
});
