<script>
	import { settings, activePreset, customPresets, customPhases, sessionStatus } from '$lib/stores.js';
	import { createPreset } from '$lib/presets.js';
	import { t } from '$lib/i18n.js';

	let locale = $derived($settings.locale || 'en');
	let preset = $derived($activePreset);
	let isRunning = $derived($sessionStatus !== 'stopped');
	let isCustomMode = $derived($settings.selectedPresetId === '__custom__');

	// Editable values for custom mode
	let inhale = $state(5);
	let retainAfterInhale = $state(0);
	let exhale = $state(5);
	let retainAfterExhale = $state(0);

	let showSaveDialog = $state(false);
	let customName = $state('');

	// Sync editable values when preset changes
	$effect(() => {
		if (!isCustomMode) {
			inhale = preset.inhale;
			retainAfterInhale = preset.retainAfterInhale;
			exhale = preset.exhale;
			retainAfterExhale = preset.retainAfterExhale;
		}
	});

	// Push custom edits to the store so the timer picks them up
	$effect(() => {
		if (isCustomMode) {
			customPhases.set({ inhale, retainAfterInhale, exhale, retainAfterExhale });
		}
	});

	// Build compact rhythm text for read-only display
	let rhythmParts = $derived.by(() => {
		const p = isCustomMode ? { inhale, retainAfterInhale, exhale, retainAfterExhale } : preset;
		const parts = [];
		parts.push(`${p.inhale}s ↑`);
		if (p.retainAfterInhale > 0) parts.push(`${p.retainAfterInhale}s ●`);
		parts.push(`${p.exhale}s ↓`);
		if (p.retainAfterExhale > 0) parts.push(`${p.retainAfterExhale}s ●`);
		return parts;
	});

	function saveAsCustom() {
		if (!customName.trim()) return;
		const newPreset = createPreset({
			name: customName.trim(),
			inhale,
			exhale,
			retainAfterInhale,
			retainAfterExhale,
			defaultMinutes: $settings.sessionMinutes
		});
		customPresets.update((list) => [...list, newPreset]);
		settings.update((s) => ({ ...s, selectedPresetId: newPreset.id }));
		showSaveDialog = false;
		customName = '';
	}
</script>

{#if isCustomMode}
	<div class="rhythm-edit" class:disabled={isRunning}>
		<div class="steppers">
			<div class="stepper-item">
				<span class="stepper-label">↑ {t(locale, 'inhaleLabel')}</span>
				<div class="stepper">
					<button class="step-btn" onclick={() => { inhale = Math.max(1, inhale - 1); }} disabled={isRunning}>−</button>
					<span class="step-value">{inhale}s</span>
					<button class="step-btn" onclick={() => { inhale = Math.min(30, inhale + 1); }} disabled={isRunning}>+</button>
				</div>
			</div>
			<div class="stepper-item">
				<span class="stepper-label">● {t(locale, 'retainAfterInhaleLabel')}</span>
				<div class="stepper">
					<button class="step-btn" onclick={() => { retainAfterInhale = Math.max(0, retainAfterInhale - 1); }} disabled={isRunning}>−</button>
					<span class="step-value">{retainAfterInhale}s</span>
					<button class="step-btn" onclick={() => { retainAfterInhale = Math.min(30, retainAfterInhale + 1); }} disabled={isRunning}>+</button>
				</div>
			</div>
			<div class="stepper-item">
				<span class="stepper-label">↓ {t(locale, 'exhaleLabel')}</span>
				<div class="stepper">
					<button class="step-btn" onclick={() => { exhale = Math.max(1, exhale - 1); }} disabled={isRunning}>−</button>
					<span class="step-value">{exhale}s</span>
					<button class="step-btn" onclick={() => { exhale = Math.min(30, exhale + 1); }} disabled={isRunning}>+</button>
				</div>
			</div>
			<div class="stepper-item">
				<span class="stepper-label">● {t(locale, 'retainAfterExhaleLabel')}</span>
				<div class="stepper">
					<button class="step-btn" onclick={() => { retainAfterExhale = Math.max(0, retainAfterExhale - 1); }} disabled={isRunning}>−</button>
					<span class="step-value">{retainAfterExhale}s</span>
					<button class="step-btn" onclick={() => { retainAfterExhale = Math.min(30, retainAfterExhale + 1); }} disabled={isRunning}>+</button>
				</div>
			</div>
		</div>
		<div class="save-row">
			{#if showSaveDialog}
				<input type="text" class="text-input" bind:value={customName} placeholder={t(locale, 'customPresetName')} />
				<button class="save-btn" onclick={saveAsCustom}>{t(locale, 'saveCustom')}</button>
			{:else}
				<button class="save-btn" onclick={() => (showSaveDialog = true)}>{t(locale, 'saveCustom')}</button>
			{/if}
		</div>
	</div>
{:else}
	<div class="rhythm-summary">
		{#each rhythmParts as part, i}
			{#if i > 0}<span class="separator">·</span>{/if}
			<span class="phase">{part}</span>
		{/each}
	</div>
{/if}

<style>
	.rhythm-summary {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0;
		font-size: 0.9rem;
		opacity: 0.7;
	}

	.separator {
		opacity: 0.4;
	}

	.rhythm-edit {
		padding: 0.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.rhythm-edit.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.steppers {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
	}

	.stepper-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.35rem;
		border-radius: 0.4rem;
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
	}

	.stepper-label {
		font-size: 0.7rem;
		opacity: 0.6;
	}

	.stepper {
		display: flex;
		align-items: center;
		width: 100%;
		border-radius: 0.4rem;
		overflow: hidden;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
	}

	.step-btn {
		width: 2rem;
		height: 2rem;
		border: none;
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-btn:active {
		background: var(--primary-color, #4a9eff);
		color: white;
	}

	.step-value {
		flex: 1;
		text-align: center;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.save-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
	}

	.text-input {
		padding: 0.3rem 0.6rem;
		border-radius: 0.4rem;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 0.8rem;
		flex: 1;
	}

	.save-btn {
		padding: 0.3rem 0.8rem;
		border-radius: 1rem;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 0.8rem;
		cursor: pointer;
	}
</style>
