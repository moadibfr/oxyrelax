import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSettings, saveSettings, loadCustomPresets, saveCustomPresets, DEFAULT_SETTINGS } from '$lib/storage.js';

const localStorageMock = (() => {
	let store = {};
	return {
		getItem: vi.fn((key) => store[key] ?? null),
		setItem: vi.fn((key, value) => { store[key] = value; }),
		removeItem: vi.fn((key) => { delete store[key]; }),
		clear: vi.fn(() => { store = {}; })
	};
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('loadSettings', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it('returns defaults when nothing stored', () => {
		const settings = loadSettings();
		expect(settings).toEqual(DEFAULT_SETTINGS);
	});

	it('returns stored settings merged with defaults', () => {
		localStorageMock.setItem('oxyrelax-settings', JSON.stringify({ soundEnabled: false }));
		const settings = loadSettings();
		expect(settings.soundEnabled).toBe(false);
		expect(settings.selectedPresetId).toBe(DEFAULT_SETTINGS.selectedPresetId);
	});

	it('includes soundTheme default', () => {
		const settings = loadSettings();
		expect(settings.soundTheme).toBe('classic');
	});

	it('preserves stored soundTheme when present', () => {
		localStorageMock.setItem('oxyrelax-settings', JSON.stringify({ soundTheme: 'oceanDrift' }));
		const settings = loadSettings();
		expect(settings.soundTheme).toBe('oceanDrift');
	});

	it('handles corrupted JSON gracefully', () => {
		localStorageMock.setItem('oxyrelax-settings', 'not-json');
		const settings = loadSettings();
		expect(settings).toEqual(DEFAULT_SETTINGS);
	});
});

describe('saveSettings', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it('persists settings to localStorage', () => {
		saveSettings({ ...DEFAULT_SETTINGS, soundEnabled: false });
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			'oxyrelax-settings',
			expect.any(String)
		);
		const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
		expect(stored.soundEnabled).toBe(false);
	});
});

describe('loadCustomPresets', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it('returns empty array when nothing stored', () => {
		expect(loadCustomPresets()).toEqual([]);
	});

	it('returns stored custom presets', () => {
		const presets = [{ id: 'custom-1', name: 'My Preset', inhale: 3, exhale: 3, retainAfterInhale: 0, retainAfterExhale: 0, defaultMinutes: 5 }];
		localStorageMock.setItem('oxyrelax-custom-presets', JSON.stringify(presets));
		expect(loadCustomPresets()).toEqual(presets);
	});
});

describe('saveCustomPresets', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it('persists custom presets', () => {
		const presets = [{ id: 'custom-1', name: 'Test' }];
		saveCustomPresets(presets);
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			'oxyrelax-custom-presets',
			JSON.stringify(presets)
		);
	});
});
