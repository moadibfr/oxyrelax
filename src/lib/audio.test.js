import { describe, it, expect } from 'vitest';
import { getFrequencyForPhase, getVolumeForPhase } from '$lib/audio.js';

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
