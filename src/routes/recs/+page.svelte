<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import FirstRunGuidance from '$lib/components/FirstRunGuidance.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RecCard from '$lib/components/RecCard.svelte';

	let { data } = $props();
	let gatedDismissed = $state(false);
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	const gatedMessage =
		'Add at least a few movies to your diary or watchlist and then check back here for some fun recommendations.';

	function startPolling() {
		if (pollInterval) return;
		pollInterval = setInterval(async () => {
			await invalidateAll();
		}, 15000);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	$effect(() => {
		if (data.generating) {
			startPolling();
		} else {
			stopPolling();
		}
	});

	onDestroy(() => stopPolling());
</script>

<PageHeader
	title="FH recs"
	subtitle="Personalised foreign and festival picks based on your taste."
/>

<div class="container recs-page">
	{#if data.generating}
		<p class="empty">We're thinking about what to recommend for you to watch — check back in a moment.</p>
	{:else if data.recommendations.length > 0}
		<div class="recs-layout">
			{#each data.recommendations as recommendation (recommendation.tmdbId ?? recommendation.title)}
				<RecCard {recommendation} />
			{/each}
		</div>
	{:else if data.gated && !gatedDismissed}
		<FirstRunGuidance message={gatedMessage} onDismiss={() => (gatedDismissed = true)} />
	{:else}
		<p class="empty">
			No recommendations yet. Add films to your watchlist and diary to get personalised picks.
		</p>
	{/if}
</div>
