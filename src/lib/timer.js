import { getActivePhases, getCycleDuration } from './presets.js';

/**
 * Compute total session duration in seconds.
 */
export function computeTotalDuration(minutes) {
	return minutes * 60;
}

/**
 * Given elapsed seconds, compute the current session state.
 * Returns: { phase, phaseProgress, bubbleY, bubbleScale, cycle, progress, done }
 *
 * bubbleY: 0 = bottom, 1 = top
 * bubbleScale: 1 = normal, >1 = pulsing during hold
 */
export function computeSessionState(preset, elapsed, totalDuration) {
	if (elapsed >= totalDuration) {
		return {
			phase: 'done',
			phaseProgress: 1,
			bubbleY: 0,
			bubbleScale: 1,
			cycle: Math.ceil(totalDuration / getCycleDuration(preset)),
			progress: 1,
			done: true
		};
	}

	const cycleDuration = getCycleDuration(preset);
	const phases = getActivePhases(preset);
	const currentCycleIndex = Math.floor(elapsed / cycleDuration);
	const timeInCycle = elapsed - currentCycleIndex * cycleDuration;

	// Find current phase
	let accumulated = 0;
	let currentPhase = phases[0];
	let phaseStartTime = 0;

	for (const phase of phases) {
		if (timeInCycle < accumulated + phase.duration) {
			currentPhase = phase;
			phaseStartTime = accumulated;
			break;
		}
		accumulated += phase.duration;
	}

	const timeInPhase = timeInCycle - phaseStartTime;
	const phaseProgress = timeInPhase / currentPhase.duration;

	// Compute bubbleY based on phase type and position
	let bubbleY;
	if (currentPhase.type === 'inhale') {
		bubbleY = phaseProgress;
	} else if (currentPhase.type === 'exhale') {
		bubbleY = 1 - phaseProgress;
	} else {
		// hold — stay where we are (after inhale = top, after exhale = bottom)
		const phaseIndex = phases.indexOf(currentPhase);
		const prevPhase = phaseIndex > 0 ? phases[phaseIndex - 1] : phases[phases.length - 1];
		bubbleY = prevPhase.type === 'inhale' ? 1 : 0;
	}

	// Bubble scale: pulse during hold
	const bubbleScale = currentPhase.type === 'hold'
		? 1 + 0.2 * Math.sin(phaseProgress * Math.PI)
		: 1;

	return {
		phase: currentPhase.type,
		phaseProgress,
		bubbleY,
		bubbleScale,
		cycle: currentCycleIndex + 1,
		progress: elapsed / totalDuration,
		done: false
	};
}
