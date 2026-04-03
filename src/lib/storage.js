const SETTINGS_KEY = 'oxyrelax-settings';
const CUSTOM_PRESETS_KEY = 'oxyrelax-custom-presets';

export const DEFAULT_SETTINGS = {
	selectedPresetId: 'coherent',
	soundEnabled: true,
	theme: 'system',
	locale: null,
	sessionMinutes: 5
};

function safeJsonParse(str, fallback) {
	try {
		return JSON.parse(str);
	} catch {
		return fallback;
	}
}

export function loadSettings() {
	const raw = localStorage.getItem(SETTINGS_KEY);
	if (!raw) return { ...DEFAULT_SETTINGS };
	const stored = safeJsonParse(raw, {});
	return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(settings) {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadCustomPresets() {
	const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
	if (!raw) return [];
	return safeJsonParse(raw, []);
}

export function saveCustomPresets(presets) {
	localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}
