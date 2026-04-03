const LOW_FREQ = 220;   // A3
const HIGH_FREQ = 440;  // A4
const HOLD_FREQ = 165;  // E3 — low, subtle hum
const CHIME_FREQ = 528; // C5 — gentle transition chime

const MAIN_VOLUME = 0.15;
const HOLD_VOLUME = 0.04; // barely audible hum

/**
 * Get the target oscillator frequency for a given phase and progress (0-1).
 */
export function getFrequencyForPhase(phase, progress) {
	switch (phase) {
		case 'inhale':
			return LOW_FREQ + (HIGH_FREQ - LOW_FREQ) * progress;
		case 'exhale':
			return HIGH_FREQ - (HIGH_FREQ - LOW_FREQ) * progress;
		case 'hold':
			return HOLD_FREQ;
		default:
			return 0;
	}
}

/**
 * Get the target volume for a given phase.
 */
export function getVolumeForPhase(phase) {
	switch (phase) {
		case 'inhale':
		case 'exhale':
			return MAIN_VOLUME;
		case 'hold':
			return HOLD_VOLUME;
		default:
			return 0;
	}
}

/**
 * Create an audio controller using Web Audio API.
 * Call start() to begin, update(phase, progress) each frame, stop() to end.
 */
export function createAudioController() {
	let audioCtx = null;
	let oscillator = null;
	let gainNode = null;
	let lastPhase = null;

	function playChime() {
		if (!audioCtx) return;
		const chimeOsc = audioCtx.createOscillator();
		const chimeGain = audioCtx.createGain();
		chimeOsc.type = 'sine';
		chimeOsc.frequency.value = CHIME_FREQ;
		chimeGain.gain.value = 0.12;
		chimeOsc.connect(chimeGain);
		chimeGain.connect(audioCtx.destination);
		const now = audioCtx.currentTime;
		chimeOsc.start(now);
		chimeGain.gain.setTargetAtTime(0, now + 0.15, 0.12);
		chimeOsc.stop(now + 0.6);
	}

	function start() {
		try {
			audioCtx = new AudioContext();
		} catch {
			return; // Browser blocked audio — fail silently
		}
		oscillator = audioCtx.createOscillator();
		gainNode = audioCtx.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.value = LOW_FREQ;
		gainNode.gain.value = MAIN_VOLUME;

		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.start();
		lastPhase = null;
	}

	function update(phase, progress) {
		if (!oscillator) return;

		// Gentle chime at phase transitions
		if (lastPhase !== null && phase !== lastPhase) {
			playChime();
		}
		lastPhase = phase;

		const freq = getFrequencyForPhase(phase, progress);
		const vol = getVolumeForPhase(phase);

		if (freq === 0) {
			gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
		} else {
			oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
			gainNode.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
		}
	}

	function playCompletionChime() {
		if (!audioCtx) return;
		// Play two chimes for a "done" feel
		const now = audioCtx.currentTime;
		for (let i = 0; i < 2; i++) {
			const chimeOsc = audioCtx.createOscillator();
			const chimeGain = audioCtx.createGain();
			chimeOsc.type = 'sine';
			chimeOsc.frequency.value = CHIME_FREQ * (i === 0 ? 1 : 1.5);
			chimeGain.gain.value = 0.18;
			chimeOsc.connect(chimeGain);
			chimeGain.connect(audioCtx.destination);
			chimeOsc.start(now + i * 0.3);
			chimeGain.gain.setTargetAtTime(0, now + i * 0.3 + 0.3, 0.2);
			chimeOsc.stop(now + i * 0.3 + 1.2);
		}
	}

	function stop() {
		if (oscillator) {
			oscillator.stop();
			oscillator = null;
		}
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
		gainNode = null;
	}

	return { start, update, stop, playCompletionChime };
}
