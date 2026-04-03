import { describe, it, expect } from 'vitest';
import { getFrequencyForPhase, getVolumeForPhase, SOUND_THEMES, createAudioController } from '$lib/audio.js';

describe('getFrequencyForPhase', () => {
	it('returns rising frequency during inhale', () => {
		const low = getFrequencyForPhase('inhale', 0);
		const high = getFrequencyForPhase('inhale', 1);
		expect(high).toBeGreaterThan(low);
	});

	it('returns falling frequency during exhale', () => {
		const start = getFrequencyForPhase('exhale', 0);
		const end = getFrequencyForPhase('exhale', 1);
		expect(start).toBeGreaterThan(end);
	});

	it('returns constant frequency during hold', () => {
		const start = getFrequencyForPhase('hold', 0);
		const mid = getFrequencyForPhase('hold', 0.5);
		expect(start).toBe(mid);
	});

	it('returns 0 for done', () => {
		expect(getFrequencyForPhase('done', 0)).toBe(0);
	});
});

describe('SOUND_THEMES', () => {
	it('exports an array of theme objects with id and labelKey', () => {
		expect(Array.isArray(SOUND_THEMES)).toBe(true);
		expect(SOUND_THEMES.length).toBe(5);
		for (const theme of SOUND_THEMES) {
			expect(theme).toHaveProperty('id');
			expect(theme).toHaveProperty('labelKey');
		}
	});

	it('includes all five themes', () => {
		const ids = SOUND_THEMES.map(t => t.id);
		expect(ids).toEqual(['classic', 'softPad', 'singingBowl', 'oceanDrift', 'windChime']);
	});
});

describe('createAudioController', () => {
	it('returns an object with start, update, stop, playCompletionChime', () => {
		const controller = createAudioController('classic');
		expect(typeof controller.start).toBe('function');
		expect(typeof controller.update).toBe('function');
		expect(typeof controller.stop).toBe('function');
		expect(typeof controller.playCompletionChime).toBe('function');
	});

	it('defaults to classic when given unknown theme', () => {
		const controller = createAudioController('nonexistent');
		expect(typeof controller.start).toBe('function');
	});

	it('accepts all valid theme IDs', () => {
		for (const theme of SOUND_THEMES) {
			const controller = createAudioController(theme.id);
			expect(typeof controller.start).toBe('function');
		}
	});
});

describe('getVolumeForPhase', () => {
	it('returns normal volume for inhale and exhale', () => {
		const inhaleVol = getVolumeForPhase('inhale');
		const exhaleVol = getVolumeForPhase('exhale');
		expect(inhaleVol).toBe(exhaleVol);
		expect(inhaleVol).toBeGreaterThan(0);
	});

	it('returns quieter volume for hold', () => {
		const holdVol = getVolumeForPhase('hold');
		const inhaleVol = getVolumeForPhase('inhale');
		expect(holdVol).toBeGreaterThan(0);
		expect(holdVol).toBeLessThan(inhaleVol);
	});

	it('returns 0 for done', () => {
		expect(getVolumeForPhase('done')).toBe(0);
	});
});
