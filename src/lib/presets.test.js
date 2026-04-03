import { describe, it, expect } from 'vitest';
import { BUILT_IN_PRESETS, createPreset, getCycleDuration, getActivePhases } from '$lib/presets.js';

describe('BUILT_IN_PRESETS', () => {
	it('has 5 presets', () => {
		expect(BUILT_IN_PRESETS).toHaveLength(5);
	});

	it('each preset has required fields', () => {
		for (const preset of BUILT_IN_PRESETS) {
			expect(preset).toHaveProperty('id');
			expect(preset).toHaveProperty('name');
			expect(preset).toHaveProperty('inhale');
			expect(preset).toHaveProperty('retainAfterInhale');
			expect(preset).toHaveProperty('exhale');
			expect(preset).toHaveProperty('retainAfterExhale');
			expect(preset).toHaveProperty('defaultMinutes');
			expect(preset.inhale).toBeGreaterThan(0);
			expect(preset.exhale).toBeGreaterThan(0);
		}
	});
});

describe('createPreset', () => {
	it('creates a preset with all fields', () => {
		const p = createPreset({ name: 'Test', inhale: 3, exhale: 4 });
		expect(p.name).toBe('Test');
		expect(p.inhale).toBe(3);
		expect(p.exhale).toBe(4);
		expect(p.retainAfterInhale).toBe(0);
		expect(p.retainAfterExhale).toBe(0);
		expect(p.defaultMinutes).toBe(5);
		expect(p.id).toBeDefined();
	});
});

describe('getCycleDuration', () => {
	it('sums all non-zero phases', () => {
		const preset = { inhale: 4, retainAfterInhale: 4, exhale: 4, retainAfterExhale: 4 };
		expect(getCycleDuration(preset)).toBe(16);
	});

	it('skips zero phases', () => {
		const preset = { inhale: 5, retainAfterInhale: 0, exhale: 5, retainAfterExhale: 0 };
		expect(getCycleDuration(preset)).toBe(10);
	});
});

describe('getActivePhases', () => {
	it('returns only non-zero phases in order', () => {
		const preset = { inhale: 4, retainAfterInhale: 0, exhale: 8, retainAfterExhale: 0 };
		const phases = getActivePhases(preset);
		expect(phases).toEqual([
			{ type: 'inhale', duration: 4 },
			{ type: 'exhale', duration: 8 }
		]);
	});

	it('includes both retains for box breathing', () => {
		const preset = { inhale: 4, retainAfterInhale: 4, exhale: 4, retainAfterExhale: 4 };
		const phases = getActivePhases(preset);
		expect(phases).toEqual([
			{ type: 'inhale', duration: 4 },
			{ type: 'hold', duration: 4 },
			{ type: 'exhale', duration: 4 },
			{ type: 'hold', duration: 4 }
		]);
	});

	it('includes retain after exhale only for Reinforce', () => {
		const preset = { inhale: 6, retainAfterInhale: 0, exhale: 6, retainAfterExhale: 10 };
		const phases = getActivePhases(preset);
		expect(phases).toEqual([
			{ type: 'inhale', duration: 6 },
			{ type: 'exhale', duration: 6 },
			{ type: 'hold', duration: 10 }
		]);
	});
});
