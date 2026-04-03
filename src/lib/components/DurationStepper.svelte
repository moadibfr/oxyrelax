<script>
	import { settings, sessionStatus } from '$lib/stores.js';
	import { t } from '$lib/i18n.js';

	let locale = $derived($settings.locale || 'en');
	let isRunning = $derived($sessionStatus !== 'stopped');
</script>

<div class="duration" class:disabled={isRunning}>
	<button
		class="step-btn"
		onclick={() => { settings.update((s) => ({ ...s, sessionMinutes: Math.max(1, s.sessionMinutes - 1) })); }}
		disabled={isRunning}
	>−</button>
	<span class="duration-value">{$settings.sessionMinutes} {t(locale, 'minutes')}</span>
	<button
		class="step-btn"
		onclick={() => { settings.update((s) => ({ ...s, sessionMinutes: Math.min(60, s.sessionMinutes + 1) })); }}
		disabled={isRunning}
	>+</button>
</div>

<style>
	.duration {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		align-self: center;
	}

	.duration.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.step-btn {
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 1.1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
	}

	.step-btn:active {
		background: var(--primary-color, #4a9eff);
		color: white;
	}

	.duration-value {
		min-width: 4rem;
		text-align: center;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0 0.5rem;
		user-select: none;
	}
</style>
