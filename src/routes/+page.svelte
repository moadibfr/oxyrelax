<script>
	import { onDestroy } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import RhythmSummary from '$lib/components/RhythmSummary.svelte';
	import DurationStepper from '$lib/components/DurationStepper.svelte';
	import BreathingBar from '$lib/components/BreathingBar.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import Instruction from '$lib/components/Instruction.svelte';
	import { settings, activePreset, sessionStatus, elapsed } from '$lib/stores.js';
	import { computeSessionState, computeTotalDuration } from '$lib/timer.js';
	import { createAudioController } from '$lib/audio.js';

	let animationId;
	let startTime;
	let pausedElapsed = 0;
	let audio = null;
	let countdown = $state(0);
	let countdownInterval = null;

	let preset = $derived($activePreset);
	let totalDuration = $derived(computeTotalDuration($settings.sessionMinutes));
	let state = $derived(computeSessionState(preset, $elapsed, totalDuration));

	function tick() {
		const now = performance.now() / 1000;
		elapsed.set(pausedElapsed + (now - startTime));

		const s = computeSessionState(preset, $elapsed, totalDuration);

		// Update audio
		if (audio && $settings.soundEnabled) {
			audio.update(s.phase, s.phaseProgress);
		}

		// Check if done
		if (s.done) {
			if (audio && $settings.soundEnabled) {
				audio.playCompletionChime();
			}
			sessionStatus.set('stopped');
			cancelAnimationFrame(animationId);
			animationId = null;
			return;
		}

		animationId = requestAnimationFrame(tick);
	}

	let countdownAudioCtx = null;

	function playCountdownChime() {
		if (!countdownAudioCtx) {
			try {
				countdownAudioCtx = new AudioContext();
			} catch {
				return;
			}
		}
		const ctx = countdownAudioCtx;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.value = 528;
		gain.gain.value = 0.15;
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		gain.gain.setTargetAtTime(0, ctx.currentTime + 0.1, 0.08);
		osc.stop(ctx.currentTime + 0.4);
	}

	function startBreathing() {
		if (countdownAudioCtx) {
			countdownAudioCtx.close();
			countdownAudioCtx = null;
		}
		elapsed.set(0);
		pausedElapsed = 0;
		startTime = performance.now() / 1000;
		sessionStatus.set('playing');

		if ($settings.soundEnabled) {
			audio = createAudioController($settings.soundTheme);
			audio.start();
		}

		animationId = requestAnimationFrame(tick);
	}

	function handleStart() {
		countdown = 3;
		sessionStatus.set('countdown');
		if ($settings.soundEnabled) playCountdownChime();

		countdownInterval = setInterval(() => {
			countdown -= 1;
			if (countdown > 0) {
				if ($settings.soundEnabled) playCountdownChime();
			} else {
				clearInterval(countdownInterval);
				countdownInterval = null;
				startBreathing();
			}
		}, 1000);
	}

	function handlePause() {
		pausedElapsed = $elapsed;
		cancelAnimationFrame(animationId);
		animationId = null;
		sessionStatus.set('paused');

		if (audio) {
			audio.stop();
			audio = null;
		}
	}

	function handleResume() {
		startTime = performance.now() / 1000;
		sessionStatus.set('playing');

		if ($settings.soundEnabled) {
			audio = createAudioController($settings.soundTheme);
			audio.start();
		}

		animationId = requestAnimationFrame(tick);
	}

	function handleStop() {
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
		countdown = 0;
		cancelAnimationFrame(animationId);
		animationId = null;
		elapsed.set(0);
		pausedElapsed = 0;
		sessionStatus.set('stopped');

		if (audio) {
			audio.stop();
			audio = null;
		}
	}

	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
		if (countdownAudioCtx) countdownAudioCtx.close();
		if (animationId) cancelAnimationFrame(animationId);
		if (audio) audio.stop();
	});
</script>

<svelte:head>
	<title>OxyRelax</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="app" data-theme={$settings.theme}>
	<Header />
	<RhythmSummary />
	<DurationStepper />

	<Controls
		status={$sessionStatus}
		onStart={handleStart}
		onPause={handlePause}
		onResume={handleResume}
		onStop={handleStop}
	/>

	<BreathingBar
		bubbleY={state.bubbleY}
		bubbleScale={state.bubbleScale}
		progress={state.progress}
	/>

	<Instruction
		phase={state.phase}
		isRunning={$sessionStatus === 'playing'}
		{countdown}
	/>
</main>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: var(--bg-color);
		color: var(--text-color);
	}

	:global(:root) {
		--bg-color: #f8f9fa;
		--text-color: #2c3e50;
		--bar-border: rgba(100, 150, 200, 0.3);
		--bar-bg: rgba(100, 150, 200, 0.05);
		--fill-color: rgba(100, 180, 255, 0.15);
		--bubble-color: rgba(70, 150, 255, 0.8);
		--bubble-glow: rgba(70, 150, 255, 0.3);
		--primary-color: #4a9eff;
		--btn-bg: transparent;
		--btn-border: #ccc;
		--input-bg: rgba(100, 150, 200, 0.08);
		--input-border: rgba(100, 150, 200, 0.2);
		--input-hover: rgba(100, 150, 200, 0.15);
	}

	:global([data-theme='dark']) {
		color-scheme: dark;
		--bg-color: #1a1a2e;
		--text-color: #e0e0e0;
		--bar-border: rgba(100, 180, 255, 0.25);
		--bar-bg: rgba(100, 180, 255, 0.05);
		--fill-color: rgba(100, 180, 255, 0.1);
		--bubble-color: rgba(100, 200, 255, 0.85);
		--bubble-glow: rgba(100, 200, 255, 0.5);
		--primary-color: #5bb5ff;
		--btn-bg: rgba(255, 255, 255, 0.05);
		--btn-border: rgba(255, 255, 255, 0.15);
		--input-bg: rgba(255, 255, 255, 0.06);
		--input-border: rgba(255, 255, 255, 0.12);
		--input-hover: rgba(255, 255, 255, 0.12);
	}

	@media (prefers-color-scheme: dark) {
		:global([data-theme='system']) {
			color-scheme: dark;
			--bg-color: #1a1a2e;
			--text-color: #e0e0e0;
			--bar-border: rgba(100, 180, 255, 0.25);
			--bar-bg: rgba(100, 180, 255, 0.05);
			--fill-color: rgba(100, 180, 255, 0.1);
			--bubble-color: rgba(100, 200, 255, 0.85);
			--bubble-glow: rgba(100, 200, 255, 0.5);
			--primary-color: #5bb5ff;
			--btn-bg: rgba(255, 255, 255, 0.05);
			--btn-border: rgba(255, 255, 255, 0.15);
			--input-bg: rgba(255, 255, 255, 0.06);
			--input-border: rgba(255, 255, 255, 0.12);
			--input-hover: rgba(255, 255, 255, 0.12);
		}
	}

	.app {
		background: var(--bg-color);
		color: var(--text-color);
		height: 100dvh;
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0 1rem;
		box-sizing: border-box;
		overflow: hidden;
	}
</style>
