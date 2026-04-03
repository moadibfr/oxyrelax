export const SUPPORTED_LOCALES = ['en', 'fr'];

export const translations = {
	en: {
		inhale: 'Inhale...',
		exhale: 'Exhale...',
		hold: 'Hold...',
		start: 'Start',
		pause: 'Pause',
		resume: 'Resume',
		stop: 'Stop',
		preset: 'Preset',
		inhaleLabel: 'Inhale',
		exhaleLabel: 'Exhale',
		retainAfterInhaleLabel: 'Hold (after inhale)',
		retainAfterExhaleLabel: 'Hold (after exhale)',
		seconds: 's',
		duration: 'Duration',
		minutes: 'min',
		sound: 'Sound',
		theme: 'Theme',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
		language: 'Language',
		saveCustom: 'Save as custom',
		deletePreset: 'Delete',
		resetPreset: 'Reset',
		customPresetName: 'Preset name',
		sessionComplete: 'Session complete!',
		getReady: 'Get ready...',
		custom: 'Custom'
	},
	fr: {
		inhale: 'Inspirez...',
		exhale: 'Expirez...',
		hold: 'Retenez...',
		start: 'Démarrer',
		pause: 'Pause',
		resume: 'Reprendre',
		stop: 'Arrêter',
		preset: 'Programme',
		inhaleLabel: 'Inspiration',
		exhaleLabel: 'Expiration',
		retainAfterInhaleLabel: 'Rétention (après inspiration)',
		retainAfterExhaleLabel: 'Rétention (après expiration)',
		seconds: 's',
		duration: 'Durée',
		minutes: 'min',
		sound: 'Son',
		theme: 'Thème',
		light: 'Clair',
		dark: 'Sombre',
		system: 'Système',
		language: 'Langue',
		saveCustom: 'Enregistrer',
		deletePreset: 'Supprimer',
		resetPreset: 'Réinitialiser',
		customPresetName: 'Nom du programme',
		sessionComplete: 'Session terminée !',
		getReady: 'Préparez-vous...',
		custom: 'Personnalisé'
	}
};

export function detectLocale(browserLocale) {
	const lang = browserLocale.split('-')[0].toLowerCase();
	if (SUPPORTED_LOCALES.includes(lang)) return lang;
	return 'en';
}

export function t(locale, key) {
	const lang = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
	return translations[lang][key] ?? key;
}
