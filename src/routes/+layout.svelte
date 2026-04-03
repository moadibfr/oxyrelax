<script>
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/sw.js`);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="{base}/manifest.json" />
	<link rel="apple-touch-icon" href="{base}/icon-192.png" />
</svelte:head>

{@render children()}
