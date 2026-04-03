/**
 * @typedef {Object} Preset
 * @property {string} id
 * @property {string} name
 * @property {number} inhale - seconds
 * @property {number} retainAfterInhale - seconds (0 = skip)
 * @property {number} exhale - seconds
 * @property {number} retainAfterExhale - seconds (0 = skip)
 * @property {number} defaultMinutes
 */

export const BUILT_IN_PRESETS = [
	{
		id: 'coherent',
		name: 'Coherent Breathing',
		inhale: 5,
		retainAfterInhale: 0,
		exhale: 5,
		retainAfterExhale: 0,
		defaultMinutes: 5
	},
	{
		id: 'box',
		name: 'Box Breathing',
		inhale: 4,
		retainAfterInhale: 4,
		exhale: 4,
		retainAfterExhale: 4,
		defaultMinutes: 4
	},
	{
		id: '478',
		name: '4-7-8 Relaxing',
		inhale: 4,
		retainAfterInhale: 7,
		exhale: 8,
		retainAfterExhale: 0,
		defaultMinutes: 5
	},
	{
		id: 'pacify',
		name: 'Pacify',
		inhale: 4,
		retainAfterInhale: 0,
		exhale: 8,
		retainAfterExhale: 0,
		defaultMinutes: 5
	},
	{
		id: 'reinforce',
		name: 'Reinforce',
		inhale: 6,
		retainAfterInhale: 0,
		exhale: 6,
		retainAfterExhale: 10,
		defaultMinutes: 5
	}
];

export function createPreset({
	name,
	inhale,
	exhale,
	retainAfterInhale = 0,
	retainAfterExhale = 0,
	defaultMinutes = 5
}) {
	return {
		id: 'custom-' + Date.now(),
		name,
		inhale,
		retainAfterInhale,
		exhale,
		retainAfterExhale,
		defaultMinutes
	};
}

export function getCycleDuration(preset) {
	return preset.inhale + preset.retainAfterInhale + preset.exhale + preset.retainAfterExhale;
}

export function getActivePhases(preset) {
	const phases = [];
	phases.push({ type: 'inhale', duration: preset.inhale });
	if (preset.retainAfterInhale > 0) {
		phases.push({ type: 'hold', duration: preset.retainAfterInhale });
	}
	phases.push({ type: 'exhale', duration: preset.exhale });
	if (preset.retainAfterExhale > 0) {
		phases.push({ type: 'hold', duration: preset.retainAfterExhale });
	}
	return phases;
}
