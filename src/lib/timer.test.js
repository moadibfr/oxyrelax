import { describe, it, expect } from 'vitest';
import { computeSessionState, computeTotalDuration } from '$lib/timer.js';

const COHERENT = {
	inhale: 5, retainAfterInhale: 0, exhale: 5, retainAfterExhale: 0
};

const BOX = {
	inhale: 4, retainAfterInhale: 4, exhale: 4, retainAfterExhale: 4
};

const REINFORCE = {
	inhale: 6, retainAfterInhale: 0, exhale: 6, retainAfterExhale: 10
};

describe('computeTotalDuration', () => {
	it('computes duration from minutes', () => {
		expect(computeTotalDuration(5)).toBe(300);
	});

	it('computes 1 minute', () => {
		expect(computeTotalDuration(1)).toBe(60);
	});
});

describe('computeSessionState', () => {
	describe('coherent breathing (5s inhale, 5s exhale)', () => {
		it('at t=0 is inhale start', () => {
			const state = computeSessionState(COHERENT, 0, 300);
			expect(state.phase).toBe('inhale');
			expect(state.phaseProgress).toBeCloseTo(0);
			expect(state.bubbleY).toBeCloseTo(0);
			expect(state.cycle).toBe(1);
			expect(state.progress).toBeCloseTo(0);
			expect(state.done).toBe(false);
		});

		it('at t=2.5 is mid inhale', () => {
			const state = computeSessionState(COHERENT, 2.5, 300);
			expect(state.phase).toBe('inhale');
			expect(state.phaseProgress).toBeCloseTo(0.5);
			expect(state.bubbleY).toBeCloseTo(0.5);
		});

		it('at t=5 starts exhale', () => {
			const state = computeSessionState(COHERENT, 5, 300);
			expect(state.phase).toBe('exhale');
			expect(state.phaseProgress).toBeCloseTo(0);
			expect(state.bubbleY).toBeCloseTo(1);
		});

		it('at t=7.5 is mid exhale', () => {
			const state = computeSessionState(COHERENT, 7.5, 300);
			expect(state.phase).toBe('exhale');
			expect(state.phaseProgress).toBeCloseTo(0.5);
			expect(state.bubbleY).toBeCloseTo(0.5);
		});

		it('at t=10 starts cycle 2', () => {
			const state = computeSessionState(COHERENT, 10, 300);
			expect(state.phase).toBe('inhale');
			expect(state.cycle).toBe(2);
		});

		it('at end of session is done', () => {
			const state = computeSessionState(COHERENT, 300, 300);
			expect(state.done).toBe(true);
			expect(state.progress).toBeCloseTo(1);
		});

		it('progress reflects elapsed / total', () => {
			const state = computeSessionState(COHERENT, 150, 300);
			expect(state.progress).toBeCloseTo(0.5);
		});
	});

	describe('box breathing (4s each phase)', () => {
		it('at t=4 is hold after inhale', () => {
			const state = computeSessionState(BOX, 4, 300);
			expect(state.phase).toBe('hold');
			expect(state.bubbleY).toBeCloseTo(1);
		});

		it('at t=8 starts exhale', () => {
			const state = computeSessionState(BOX, 8, 300);
			expect(state.phase).toBe('exhale');
			expect(state.bubbleY).toBeCloseTo(1);
		});

		it('at t=12 is hold after exhale', () => {
			const state = computeSessionState(BOX, 12, 300);
			expect(state.phase).toBe('hold');
			expect(state.bubbleY).toBeCloseTo(0);
		});
	});

	describe('reinforce (6s inhale, 6s exhale, 10s hold after exhale)', () => {
		it('at t=12 starts hold after exhale', () => {
			const state = computeSessionState(REINFORCE, 12, 300);
			expect(state.phase).toBe('hold');
			expect(state.bubbleY).toBeCloseTo(0);
		});

		it('at t=22 starts cycle 2', () => {
			const state = computeSessionState(REINFORCE, 22, 300);
			expect(state.phase).toBe('inhale');
			expect(state.cycle).toBe(2);
		});
	});
});
