<script>
	import { settings } from '$lib/stores.js';
	import { t } from '$lib/i18n.js';

	let { phase = 'inhale', isRunning = false, countdown = 0 } = $props();

	let locale = $derived($settings.locale || 'en');
	let label = $derived(
		countdown > 0
			? String(countdown)
			: phase === 'done'
				? t(locale, 'sessionComplete')
				: isRunning
					? t(locale, phase)
					: ''
	);
	let sublabel = $derived(
		countdown > 0 ? t(locale, 'getReady') : ''
	);
</script>

<div class="instruction">
	<div class="label-group" class:visible={isRunning || phase === 'done' || countdown > 0}>
		<span class="label" class:countdown={countdown > 0}>{label}</span>
		{#if sublabel}
			<span class="sublabel">{sublabel}</span>
		{/if}
	</div>
</div>

<style>
	.instruction {
		text-align: center;
		padding: 0.75rem;
		min-height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.label-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.label-group.visible {
		opacity: 1;
	}

	.label {
		font-size: 1.3rem;
		font-weight: 300;
		letter-spacing: 0.1em;
	}

	.label.countdown {
		font-size: 2rem;
		font-weight: 600;
		letter-spacing: 0;
	}

	.sublabel {
		font-size: 0.85rem;
		opacity: 0.6;
	}
</style>
