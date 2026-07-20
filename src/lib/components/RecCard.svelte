<script lang="ts">
	import { enhance } from '$app/forms';

	type Recommendation = {
		tmdbId: number | null;
		title: string;
		posterPath: string | null;
		genres: string | null;
		director: string | null;
		country: string | null;
		language: string | null;
		isIndependent: boolean;
		pitch: string | null;
		funFact: string | null;
	};

	let { recommendation }: { recommendation: Recommendation } = $props();
	let added = $state(false);
</script>

<article class="rec-card">
	<div class="rec-card-poster-wrap">
		{#if recommendation.posterPath}
			<img
				src={recommendation.posterPath}
				alt="Poster for {recommendation.title}"
				class="rec-card-poster"
			/>
		{:else}
			<span class="poster-placeholder rec-card-poster" aria-hidden="true"></span>
		{/if}
	</div>

	<div class="rec-card-info">
		<h3 class="rec-card-title">{recommendation.title}</h3>

		{#if recommendation.director}
			<span class="movie-meta">{recommendation.director}</span>
		{/if}
		{#if recommendation.genres}
			<span class="movie-meta">{recommendation.genres}</span>
		{/if}

		{#if recommendation.country || recommendation.language || recommendation.isIndependent}
			<div class="rec-card-facts">
				{#if recommendation.country}
					<span class="rec-card-meta">{recommendation.country}</span>
				{/if}
				{#if recommendation.language}
					<span class="rec-card-meta">{recommendation.language}</span>
				{/if}
				{#if recommendation.isIndependent}
					<span class="rec-badge-indie">Independent</span>
				{/if}
			</div>
		{/if}

		{#if recommendation.pitch}
			<p class="rec-card-pitch">{recommendation.pitch}</p>
		{/if}

		{#if recommendation.funFact}
			<p class="rec-card-fun-fact">{recommendation.funFact}</p>
		{/if}

		{#if recommendation.tmdbId}
			{#if added}
				<div class="rec-card-cta-form">
					<span class="rec-card-cta rec-card-cta-added">On your Watchlist</span>
				</div>
			{:else}
				<form
					method="post"
					action="?/addMovie"
					use:enhance={() => {
						return async ({ update }) => {
							added = true;
							await update({ invalidateAll: false });
						};
					}}
					class="rec-card-cta-form"
				>
					<input type="hidden" name="title" value={recommendation.title} />
					<input type="hidden" name="listType" value="want_to_watch" />
					<input type="hidden" name="tmdbId" value={recommendation.tmdbId} />
					<input type="hidden" name="posterPath" value={recommendation.posterPath ?? ''} />
					<button type="submit" class="rec-card-cta">Add to Watchlist</button>
				</form>
			{/if}
		{/if}
	</div>
</article>
