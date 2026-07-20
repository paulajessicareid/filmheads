<script lang="ts">
	import FirstRunGuidance from '$lib/components/FirstRunGuidance.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RecCard from '$lib/components/RecCard.svelte';

	let { data } = $props();
	let gatedDismissed = $state(false);

	const gatedMessage =
		'Add at least a few movies to your diary or watchlist and then check back here for some fun recommendations.';
</script>

<PageHeader
	title="FH recs"
	subtitle="Personalised foreign and festival picks based on your taste."
/>

<div class="container">
	<section class="content-section">
		{#if data.error}
			<p class="empty">{data.error}</p>
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
	</section>
</div>
