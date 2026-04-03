// --- Theme registry ---

export const SOUND_THEMES = [
	{ id: 'classic', labelKey: 'classic' },
	{ id: 'softPad', labelKey: 'softPad' },
	{ id: 'singingBowl', labelKey: 'singingBowl' },
	{ id: 'oceanDrift', labelKey: 'oceanDrift' },
	{ id: 'windChime', labelKey: 'windChime' }
];

// --- Classic theme helpers (kept exported for backward-compat tests) ---

const LOW_FREQ = 220;   // A3
const HIGH_FREQ = 440;  // A4
const HOLD_FREQ = 165;  // E3
const CHIME_FREQ = 528; // C5
const MAIN_VOLUME = 0.15;
const HOLD_VOLUME = 0.04;

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

// --- Theme: Classic ---

function createClassicController() {
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
			return;
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

// --- Theme: Soft Pad ---

function createSoftPadController() {
	let audioCtx = null;
	let oscillators = [];
	let gainNode = null;
	let filterNode = null;
	let lastPhase = null;

	const BASE_FREQ = 220;
	const DETUNE_SPREAD = [0, -7, 7, -12, 12]; // cents
	const PAD_VOLUME = 0.10;
	const HOLD_VOL = 0.04;

	function start() {
		try {
			audioCtx = new AudioContext();
		} catch {
			return;
		}
		gainNode = audioCtx.createGain();
		gainNode.gain.value = PAD_VOLUME;

		filterNode = audioCtx.createBiquadFilter();
		filterNode.type = 'lowpass';
		filterNode.frequency.value = 600;
		filterNode.Q.value = 0.7;
		filterNode.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		DETUNE_SPREAD.forEach((detune) => {
			const osc = audioCtx.createOscillator();
			osc.type = 'sine';
			osc.frequency.value = BASE_FREQ;
			osc.detune.value = detune;
			osc.connect(filterNode);
			osc.start();
			oscillators.push(osc);
		});
		lastPhase = null;
	}

	function update(phase, progress) {
		if (!oscillators.length || !audioCtx) return;

		let targetFreq, targetVol, targetFilter;
		switch (phase) {
			case 'inhale':
				targetFreq = BASE_FREQ + 110 * progress;
				targetVol = PAD_VOLUME;
				targetFilter = 600 + 800 * progress;
				break;
			case 'exhale':
				targetFreq = 330 - 110 * progress;
				targetVol = PAD_VOLUME;
				targetFilter = 1400 - 800 * progress;
				break;
			case 'hold':
				targetFreq = lastPhase === 'inhale' ? 330 : BASE_FREQ;
				targetVol = HOLD_VOL;
				targetFilter = 500;
				break;
			default:
				targetVol = 0;
				targetFreq = BASE_FREQ;
				targetFilter = 400;
		}

		const now = audioCtx.currentTime;
		oscillators.forEach((osc) => {
			osc.frequency.setTargetAtTime(targetFreq, now, 0.3);
		});
		gainNode.gain.setTargetAtTime(targetVol, now, 0.3);
		filterNode.frequency.setTargetAtTime(targetFilter, now, 0.3);

		if (phase !== 'hold') lastPhase = phase;
	}

	function playCompletionChime() {
		if (!audioCtx) return;
		const now = audioCtx.currentTime;
		[264, 330, 396].forEach((freq, i) => {
			const osc = audioCtx.createOscillator();
			const g = audioCtx.createGain();
			osc.type = 'sine';
			osc.frequency.value = freq;
			g.gain.value = 0.10;
			osc.connect(g);
			g.connect(audioCtx.destination);
			osc.start(now + i * 0.15);
			g.gain.setTargetAtTime(0, now + i * 0.15 + 0.5, 0.4);
			osc.stop(now + i * 0.15 + 2);
		});
	}

	function stop() {
		oscillators.forEach((osc) => { try { osc.stop(); } catch {} });
		oscillators = [];
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
		gainNode = null;
		filterNode = null;
	}

	return { start, update, stop, playCompletionChime };
}

// --- Theme: Singing Bowl ---

function createSingingBowlController() {
	let audioCtx = null;
	let activeOscillators = [];
	let lastPhase = null;

	const FUNDAMENTAL = 256;
	const HARMONICS = [1, 2.76, 4.72];
	const STRIKE_VOLUME = 0.12;

	function strike(freq, volume) {
		if (!audioCtx) return;
		const now = audioCtx.currentTime;
		HARMONICS.forEach((ratio, i) => {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			osc.type = 'sine';
			osc.frequency.value = freq * ratio;
			gain.gain.value = volume / (i + 1);
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			osc.start(now);
			gain.gain.setTargetAtTime(0, now + 0.1, 1.5 / (i + 1));
			osc.stop(now + 6);
			activeOscillators.push(osc);
		});
	}

	function start() {
		try {
			audioCtx = new AudioContext();
		} catch {
			return;
		}
		activeOscillators = [];
		lastPhase = null;
	}

	function update(phase, _progress) {
		if (!audioCtx) return;
		if (lastPhase !== null && phase !== lastPhase) {
			const freq = phase === 'inhale' ? FUNDAMENTAL : FUNDAMENTAL * 1.5;
			strike(freq, STRIKE_VOLUME);
		}
		if (lastPhase === null) {
			strike(FUNDAMENTAL, STRIKE_VOLUME);
		}
		lastPhase = phase;
	}

	function playCompletionChime() {
		if (!audioCtx) return;
		strike(FUNDAMENTAL * 0.75, STRIKE_VOLUME * 1.5);
		setTimeout(() => strike(FUNDAMENTAL, STRIKE_VOLUME * 1.2), 500);
	}

	function stop() {
		activeOscillators.forEach((osc) => { try { osc.stop(); } catch {} });
		activeOscillators = [];
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
	}

	return { start, update, stop, playCompletionChime };
}

// --- Theme: Ocean Drift ---

function createOceanDriftController() {
	let audioCtx = null;
	let noiseNode = null;
	let filterNode = null;
	let gainNode = null;
	let lastPhase = null;

	const MAX_VOLUME = 0.18;
	const HOLD_VOL = 0.06;

	function createWhiteNoise(ctx) {
		const bufferSize = ctx.sampleRate * 2;
		const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;
		return source;
	}

	function start() {
		try {
			audioCtx = new AudioContext();
		} catch {
			return;
		}
		noiseNode = createWhiteNoise(audioCtx);

		filterNode = audioCtx.createBiquadFilter();
		filterNode.type = 'bandpass';
		filterNode.frequency.value = 500;
		filterNode.Q.value = 0.5;

		gainNode = audioCtx.createGain();
		gainNode.gain.value = MAX_VOLUME;

		noiseNode.connect(filterNode);
		filterNode.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		noiseNode.start();
		lastPhase = null;
	}

	function update(phase, progress) {
		if (!audioCtx || !filterNode) return;

		const now = audioCtx.currentTime;
		let targetFilter, targetVol;

		switch (phase) {
			case 'inhale':
				targetFilter = 300 + 1200 * progress;
				targetVol = 0.06 + (MAX_VOLUME - 0.06) * progress;
				break;
			case 'exhale':
				targetFilter = 1500 - 1200 * progress;
				targetVol = MAX_VOLUME - (MAX_VOLUME - 0.06) * progress;
				break;
			case 'hold':
				targetFilter = 400;
				targetVol = HOLD_VOL;
				break;
			default:
				targetFilter = 300;
				targetVol = 0;
		}

		filterNode.frequency.setTargetAtTime(targetFilter, now, 0.15);
		gainNode.gain.setTargetAtTime(targetVol, now, 0.15);
		lastPhase = phase;
	}

	function playCompletionChime() {
		if (!audioCtx) return;
		const now = audioCtx.currentTime;
		if (filterNode) {
			filterNode.frequency.setTargetAtTime(2000, now, 0.1);
			filterNode.frequency.setTargetAtTime(200, now + 0.5, 0.5);
		}
		if (gainNode) {
			gainNode.gain.setTargetAtTime(MAX_VOLUME * 1.3, now, 0.1);
			gainNode.gain.setTargetAtTime(0, now + 0.5, 0.8);
		}
	}

	function stop() {
		if (noiseNode) { try { noiseNode.stop(); } catch {} }
		noiseNode = null;
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
		filterNode = null;
		gainNode = null;
	}

	return { start, update, stop, playCompletionChime };
}

// --- Theme: Wind Chime ---

function createWindChimeController() {
	let audioCtx = null;
	let lastPhase = null;

	const CHIME_NOTES = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5 D5 E5 G5 A5
	const CHIME_VOLUME = 0.10;

	function playNote(freq, delay) {
		if (!audioCtx) return;
		const now = audioCtx.currentTime + delay;
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = 'triangle';
		osc.frequency.value = freq;
		gain.gain.value = CHIME_VOLUME;
		osc.connect(gain);
		gain.connect(audioCtx.destination);
		osc.start(now);
		gain.gain.setTargetAtTime(0, now + 0.08, 0.3);
		osc.stop(now + 1.5);
	}

	function playRandomChime() {
		const note = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
		playNote(note, 0);
		if (Math.random() > 0.5) {
			const note2 = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
			playNote(note2, 0.12);
		}
	}

	function start() {
		try {
			audioCtx = new AudioContext();
		} catch {
			return;
		}
		lastPhase = null;
	}

	function update(phase, _progress) {
		if (!audioCtx) return;
		if (lastPhase !== null && phase !== lastPhase) {
			playRandomChime();
		}
		if (lastPhase === null) {
			playRandomChime();
		}
		lastPhase = phase;
	}

	function playCompletionChime() {
		if (!audioCtx) return;
		CHIME_NOTES.forEach((note, i) => {
			playNote(note, i * 0.2);
		});
	}

	function stop() {
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
	}

	return { start, update, stop, playCompletionChime };
}

// --- Factory ---

const THEME_FACTORIES = {
	classic: createClassicController,
	softPad: createSoftPadController,
	singingBowl: createSingingBowlController,
	oceanDrift: createOceanDriftController,
	windChime: createWindChimeController
};

/**
 * Create an audio controller for the given theme.
 * Falls back to 'classic' if theme ID is unknown.
 */
export function createAudioController(themeId = 'classic') {
	const factory = THEME_FACTORIES[themeId] || THEME_FACTORIES.classic;
	return factory();
}
