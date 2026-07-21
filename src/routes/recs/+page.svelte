<script lang="ts">
	import { onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import FirstRunGuidance from '$lib/components/FirstRunGuidance.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RecCard from '$lib/components/RecCard.svelte';

	let { data } = $props();
	let gatedDismissed = $state(false);
	let generatingLongWait = $state(false);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let longWaitTimeout: ReturnType<typeof setTimeout> | null = null;

	const gatedMessage =
		'Add at least a few movies to your diary or watchlist and then check back here for some fun recommendations.';

	const POLL_INTERVAL_MS = 5000;
	const LONG_WAIT_MS = 60_000;

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	function stopLongWaitTimer() {
		if (longWaitTimeout) {
			clearTimeout(longWaitTimeout);
			longWaitTimeout = null;
		}
		generatingLongWait = false;
	}

	function startPolling() {
		stopPolling();
		void invalidateAll();
		pollInterval = setInterval(() => {
			void invalidateAll();
		}, POLL_INTERVAL_MS);
	}

	$effect(() => {
		if (data.generating) {
			stopLongWaitTimer();
			longWaitTimeout = setTimeout(() => {
				generatingLongWait = true;
			}, LONG_WAIT_MS);
			startPolling();
		} else {
			stopPolling();
			stopLongWaitTimer();
		}
	});

	onDestroy(() => {
		stopPolling();
		stopLongWaitTimer();
	});
</script>

<PageHeader
	title="FH recs"
	subtitle="Personalised foreign and festival picks based on your taste."
/>

<div class="container recs-page">
	{#if data.generating}
		<p class="empty">
			{#if generatingLongWait}
				Still working on your picks — this can take up to a minute.
			{:else}
				We're thinking about what to recommend for you to watch — check back in a moment.
			{/if}
		</p>
	{:else if data.recommendations.length > 0}
		<div class="recs-layout">
			{#each data.recommendations as recommendation (recommendation.tmdbId ?? recommendation.title)}
				<RecCard {recommendation} />
			{/each}
		</div>
	{:else if data.generationFailed}
		<p class="empty">
			We couldn't put together recommendations right now. Try again in a moment.
		</p>
		<form method="post" action="?/retry" use:enhance={() => invalidateAll()}>
			<button type="submit" class="btn-primary">Try again</button>
		</form>
	{:else if data.gated && !gatedDismissed}
		<FirstRunGuidance message={gatedMessage} onDismiss={() => (gatedDismissed = true)} />
	{:else}
		<p class="empty">
			No recommendations yet. Add films to your watchlist and diary to get personalised picks.
		</p>
	{/if}
</div>
