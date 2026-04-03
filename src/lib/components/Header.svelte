<script>
	import { settings, allPresets, activePreset, customPresets, sessionStatus } from '$lib/stores.js';
	import { t, SUPPORTED_LOCALES } from '$lib/i18n.js';

	let isRunning = $derived($sessionStatus !== 'stopped');
	let locale = $derived($settings.locale || 'en');
	let preset = $derived($activePreset);
	let gearOpen = $state(false);

	function selectPreset(id) {
		settings.update((s) => ({ ...s, selectedPresetId: id }));
	}

	function toggleSound() {
		settings.update((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
	}

	function setLocale(loc) {
		settings.update((s) => ({ ...s, locale: loc }));
	}

	function handleGearClick(e) {
		e.stopPropagation();
		gearOpen = !gearOpen;
	}

	function closeGear() {
		gearOpen = false;
	}
</script>

<svelte:window onclick={closeGear} />

<header class="header" class:disabled={isRunning}>
	<h1 class="app-name">OxyRelax</h1>

	<div class="header-controls">
		<button
			class="icon-btn"
			class:muted={!$settings.soundEnabled}
			onclick={toggleSound}
			disabled={isRunning}
			aria-label={t(locale, 'sound')}
			title={t(locale, 'sound')}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
				{#if $settings.soundEnabled}
					<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
				{:else}
					<line x1="23" y1="9" x2="17" y2="15" />
					<line x1="17" y1="9" x2="23" y2="15" />
				{/if}
			</svg>
		</button>

		<div class="gear-wrapper">
			<button
				class="icon-btn"
				onclick={handleGearClick}
				disabled={isRunning}
				aria-label="Settings"
				title="Settings"
			>⚙</button>

			{#if gearOpen}
				<div class="gear-popover" onclick={(e) => e.stopPropagation()}>
					<div class="popover-row">
						<span>{t(locale, 'theme')}</span>
						<div class="toggle-group">
							{#each ['system', 'light', 'dark'] as th}
								<button
									class="toggle-option"
									class:active={$settings.theme === th}
									onclick={() => { settings.update((s) => ({ ...s, theme: th })); }}
								>{t(locale, th)}</button>
							{/each}
						</div>
					</div>
					<div class="popover-row">
						<span>{t(locale, 'language')}</span>
						<div class="toggle-group">
							{#each SUPPORTED_LOCALES as loc}
								<button
									class="toggle-option"
									class:active={$settings.locale === loc}
									onclick={() => setLocale(loc)}
								>{loc.toUpperCase()}</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<select
			value={preset.id}
			onchange={(e) => selectPreset(e.target.value)}
			disabled={isRunning}
		>
			{#each $allPresets as p}
				<option value={p.id}>{p.name}</option>
			{/each}
			<option value="__custom__">{t(locale, 'custom')}</option>
		</select>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		gap: 0.75rem;
		min-height: 2.75rem;
	}

	.header.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.app-name {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 300;
		letter-spacing: 0.12em;
		opacity: 0.7;
		white-space: nowrap;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex: 1;
		justify-content: flex-end;
		min-width: 0;
	}

	.icon-btn {
		background: none;
		border: none;
		font-size: 1.35rem;
		cursor: pointer;
		padding: 0.4rem;
		border-radius: 0.4rem;
		color: var(--text-color, inherit);
		transition: opacity 0.15s;
	}

	.icon-btn:hover {
		opacity: 0.7;
	}

	.icon-btn.muted {
		opacity: 0.4;
	}

	.gear-wrapper {
		position: relative;
	}

	.gear-popover {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		background: var(--bg-color, #fff);
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		border-radius: 0.5rem;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 10rem;
	}

	.popover-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.toggle-group {
		display: flex;
		border-radius: 0.4rem;
		overflow: hidden;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
	}

	.toggle-option {
		padding: 0.25rem 0.5rem;
		border: none;
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.toggle-option:not(:last-child) {
		border-right: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
	}

	.toggle-option.active {
		background: var(--primary-color, #4a9eff);
		color: white;
		font-weight: 600;
	}

	select {
		padding: 0.45rem 0.6rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		background: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 0.9rem;
		cursor: pointer;
		min-width: 0;
		max-width: 10rem;
	}
</style>
