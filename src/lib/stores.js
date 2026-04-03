import { writable, derived } from 'svelte/store';
import { BUILT_IN_PRESETS } from './presets.js';
import { loadSettings, saveSettings, loadCustomPresets, saveCustomPresets, DEFAULT_SETTINGS } from './storage.js';
import { detectLocale } from './i18n.js';

// --- Settings ---

function createSettingsStore() {
	const initial = typeof window !== 'undefined' ? loadSettings() : DEFAULT_SETTINGS;

	// Auto-detect locale if not set
	if (!initial.locale && typeof navigator !== 'undefined') {
		initial.locale = detectLocale(navigator.language);
	}

	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		set(value) {
			set(value);
			if (typeof window !== 'undefined') saveSettings(value);
		},
		update(fn) {
			update((current) => {
				const next = fn(current);
				if (typeof window !== 'undefined') saveSettings(next);
				return next;
			});
		}
	};
}

export const settings = createSettingsStore();

// --- Custom Presets ---

function createCustomPresetsStore() {
	const initial = typeof window !== 'undefined' ? loadCustomPresets() : [];
	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		set(value) {
			set(value);
			if (typeof window !== 'undefined') saveCustomPresets(value);
		},
		update(fn) {
			update((current) => {
				const next = fn(current);
				if (typeof window !== 'undefined') saveCustomPresets(next);
				return next;
			});
		}
	};
}

export const customPresets = createCustomPresetsStore();

// --- All presets (built-in + custom) ---

export const allPresets = derived(customPresets, ($custom) => {
	return [...BUILT_IN_PRESETS, ...$custom];
});

// --- Active preset ---

// --- Custom phase values (editable when in custom mode) ---

export const customPhases = writable({
	inhale: 5,
	retainAfterInhale: 0,
	exhale: 5,
	retainAfterExhale: 0
});

// --- Active preset ---

export const activePreset = derived(
	[settings, allPresets, customPhases],
	([$settings, $allPresets, $customPhases]) => {
		if ($settings.selectedPresetId === '__custom__') {
			return { id: '__custom__', name: 'Custom', ...$customPhases, defaultMinutes: 5 };
		}
		return $allPresets.find((p) => p.id === $settings.selectedPresetId) ?? BUILT_IN_PRESETS[0];
	}
);

// --- Session state ---

export const sessionStatus = writable('stopped'); // 'stopped' | 'countdown' | 'playing' | 'paused'
export const elapsed = writable(0);
