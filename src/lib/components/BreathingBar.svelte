<script>
	let { bubbleY = 0, bubbleScale = 1, progress = 0 } = $props();

	let fillHeight = $derived(progress * 100);
</script>

<div class="bar-container">
	<div class="bar">
		<div class="fill" style="height: {fillHeight}%"></div>
	</div>
	<div class="bubble-track">
		<div class="bubble-space">
			<div
				class="bubble"
				style="bottom: {bubbleY * 100}%; transform: translateX(-50%) scale({bubbleScale})"
			></div>
		</div>
	</div>
</div>

<style>
	.bar-container {
		display: flex;
		justify-content: center;
		align-items: stretch;
		flex: 1;
		padding: 1.5rem 1rem 1rem;
		min-height: 300px;
		position: relative;
		overflow: hidden;
	}

	.bar {
		position: relative;
		width: 5rem;
		height: 100%;
		border-radius: 2.5rem;
		border: 2px solid var(--bar-border, rgba(128, 128, 128, 0.4));
		overflow: hidden;
		background: var(--bar-bg, rgba(128, 128, 128, 0.05));
	}

	.fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--fill-color, rgba(100, 180, 255, 0.2));
		transition: height 0.5s linear;
	}

	/*
	 * The bubble track is absolutely positioned over the bar.
	 * Inside, .bubble-space provides the actual area the bubble moves in,
	 * inset by the bubble radius so 0% = fully visible at bottom, 100% = fully visible at top.
	 */
	.bubble-track {
		position: absolute;
		top: 1.5rem;   /* match container padding */
		bottom: 1rem;
		left: 50%;
		width: 0;
	}

	.bubble-space {
		position: absolute;
		top: 2.5rem;    /* bubble radius inset from top */
		bottom: 2.5rem; /* bubble radius inset from bottom */
		left: 0;
		width: 0;
	}

	.bubble {
		position: absolute;
		left: 50%;
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: var(--bubble-color, rgba(100, 180, 255, 0.8));
		box-shadow: 0 0 24px var(--bubble-glow, rgba(100, 180, 255, 0.4));
		transition: bottom 0.15s linear, transform 0.15s ease-out;
		/* Center the bubble on the bottom position */
		margin-bottom: -2.5rem;
		z-index: 1;
	}
</style>
