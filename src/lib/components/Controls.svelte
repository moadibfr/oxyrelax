<script>
	import { settings } from '$lib/stores.js';
	import { t } from '$lib/i18n.js';

	let { status = 'stopped', onStart, onPause, onResume, onStop } = $props();

	let locale = $derived($settings.locale || 'en');
</script>

<div class="controls">
	{#if status === 'stopped'}
		<button class="primary" onclick={onStart}>{t(locale, 'start')}</button>
	{:else if status === 'countdown'}
		<button onclick={onStop}>{t(locale, 'stop')}</button>
	{:else if status === 'playing'}
		<button onclick={onPause}>{t(locale, 'pause')}</button>
		<button onclick={onStop}>{t(locale, 'stop')}</button>
	{:else if status === 'paused'}
		<button class="primary" onclick={onResume}>{t(locale, 'resume')}</button>
		<button onclick={onStop}>{t(locale, 'stop')}</button>
	{/if}
</div>

<style>
	.controls {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding: 0.75rem;
	}

	button {
		padding: 0.6rem 1.5rem;
		border-radius: 2rem;
		border: 1px solid var(--btn-border, #ccc);
		background: var(--btn-bg, transparent);
		color: var(--text-color, inherit);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	button.primary {
		background: var(--primary-color, #4a9eff);
		color: white;
		border-color: var(--primary-color, #4a9eff);
	}

	button:hover {
		opacity: 0.85;
	}
</style>
