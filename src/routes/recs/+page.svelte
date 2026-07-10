<script lang="ts">
	import RecCard from '$lib/components/RecCard.svelte';

	let { data } = $props();
</script>

<div class="container">
	<section class="content-section">
		<h2>Your FH recs</h2>

		{#if data.error}
			<p class="empty">{data.error}</p>
		{:else if data.recommendations.length > 0}
			<div class="recs-layout">
				{#each data.recommendations as recommendation (recommendation.tmdbId ?? recommendation.title)}
					<RecCard {recommendation} />
				{/each}
			</div>
		{:else}
			<p class="empty">
				No recommendations yet. Add films to your watchlist and diary to get personalised picks.
			</p>
		{/if}
	</section>
</div>
