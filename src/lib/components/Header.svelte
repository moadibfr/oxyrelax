<script>
	import { settings, allPresets, activePreset, customPresets, sessionStatus } from '$lib/stores.js';
	import { t, SUPPORTED_LOCALES } from '$lib/i18n.js';
	import { SOUND_THEMES } from '$lib/audio.js';

	let isRunning = $derived($sessionStatus !== 'stopped');
	let locale = $derived($settings.locale || 'en');
	let preset = $derived($activePreset);
	let gearOpen = $state(false);
	let soundOpen = $state(false);
	let presetOpen = $state(false);

	function selectPreset(id) {
		settings.update((s) => ({ ...s, selectedPresetId: id }));
	}

	function toggleSound() {
		settings.update((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
	}

	function setSoundTheme(themeId) {
		settings.update((s) => ({ ...s, soundTheme: themeId }));
	}

	function setLocale(loc) {
		settings.update((s) => ({ ...s, locale: loc }));
	}

	function handleSoundClick(e) {
		e.stopPropagation();
		soundOpen = !soundOpen;
		if (soundOpen) { gearOpen = false; presetOpen = false; }
	}

	function handleGearClick(e) {
		e.stopPropagation();
		gearOpen = !gearOpen;
		if (gearOpen) { soundOpen = false; presetOpen = false; }
	}

	function handlePresetClick(e) {
		e.stopPropagation();
		presetOpen = !presetOpen;
		if (presetOpen) { soundOpen = false; gearOpen = false; }
	}

	function closePopovers() {
		gearOpen = false;
		soundOpen = false;
		presetOpen = false;
	}
</script>

<svelte:window onclick={closePopovers} />

<header class="header" class:disabled={isRunning}>
	<h1 class="app-name">OxyRelax</h1>

	<div class="header-controls">
		<div class="sound-wrapper">
			<button
				class="icon-btn"
				class:muted={!$settings.soundEnabled}
				onclick={handleSoundClick}
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

			{#if soundOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="sound-popover" onclick={(e) => e.stopPropagation()}>
					<div class="popover-row">
						<span>{t(locale, 'sound')}</span>
						<div class="toggle-group">
							<button
								class="toggle-option"
								class:active={$settings.soundEnabled}
								onclick={() => { if (!$settings.soundEnabled) toggleSound(); }}
							>{t(locale, 'on')}</button>
							<button
								class="toggle-option"
								class:active={!$settings.soundEnabled}
								onclick={() => { if ($settings.soundEnabled) toggleSound(); }}
							>{t(locale, 'off')}</button>
						</div>
					</div>
					<div class="popover-divider"></div>
					<div class="theme-list" class:disabled={!$settings.soundEnabled}>
						{#each SOUND_THEMES as theme}
							<button
								class="theme-option"
								class:active={$settings.soundTheme === theme.id}
								disabled={!$settings.soundEnabled}
								onclick={() => setSoundTheme(theme.id)}
							>{t(locale, theme.labelKey)}</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="gear-wrapper">
			<button
				class="icon-btn"
				onclick={handleGearClick}
				disabled={isRunning}
				aria-label="Settings"
				title="Settings"
			><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
				</svg></button>

			{#if gearOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
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

		<div class="preset-wrapper">
			<button
				class="preset-btn"
				onclick={handlePresetClick}
				disabled={isRunning}
			>{preset.id === '__custom__' ? t(locale, 'custom') : preset.name}</button>

			{#if presetOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="preset-popover" onclick={(e) => e.stopPropagation()}>
					{#each $allPresets as p}
						<button
							class="theme-option"
							class:active={preset.id === p.id}
							onclick={() => { selectPreset(p.id); presetOpen = false; }}
						>{p.name}</button>
					{/each}
					<button
						class="theme-option"
						class:active={preset.id === '__custom__'}
						onclick={() => { selectPreset('__custom__'); presetOpen = false; }}
					>{t(locale, 'custom')}</button>
				</div>
			{/if}
		</div>
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
		cursor: pointer;
		padding: 0.4rem;
		border-radius: 0.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color, inherit);
		transition: opacity 0.15s;
	}

	.icon-btn:hover {
		opacity: 0.7;
	}

	.icon-btn.muted {
		opacity: 0.4;
	}

	.sound-wrapper {
		position: relative;
	}

	.sound-popover {
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
		gap: 0.4rem;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 11rem;
	}

	.popover-divider {
		height: 1px;
		background: var(--input-border, rgba(128, 128, 128, 0.2));
		margin: 0.1rem 0;
	}

	.theme-list {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.theme-list.disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.theme-option {
		padding: 0.35rem 0.5rem;
		border: none;
		background: transparent;
		color: var(--text-color, inherit);
		font-size: 0.8rem;
		cursor: pointer;
		border-radius: 0.3rem;
		text-align: left;
		transition: background 0.15s;
	}

	.theme-option:hover {
		background: var(--input-hover, rgba(128, 128, 128, 0.1));
	}

	.theme-option.active {
		background: var(--primary-color, #4a9eff);
		color: white;
		font-weight: 600;
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

	.preset-wrapper {
		position: relative;
	}

	.preset-btn {
		padding: 0.45rem 0.6rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		background-color: var(--input-bg, rgba(128, 128, 128, 0.08));
		color: var(--text-color, inherit);
		font-size: 0.9rem;
		cursor: pointer;
		min-width: 0;
		max-width: 10rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.preset-popover {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		background: var(--bg-color, #fff);
		border: 1px solid var(--input-border, rgba(128, 128, 128, 0.2));
		border-radius: 0.5rem;
		padding: 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 10rem;
	}
</style>
