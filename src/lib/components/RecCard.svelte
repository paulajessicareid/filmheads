<script lang="ts">
	type Recommendation = {
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
</script>

<article class="rec-card">
	<div class="rec-card-poster-wrap">
		{#if recommendation.posterPath}
			<img src={recommendation.posterPath} alt="" class="poster-card rec-card-poster" />
		{:else}
			<span class="poster-placeholder poster-card rec-card-poster" aria-hidden="true"></span>
		{/if}
	</div>

	<div class="rec-card-info">
		<h3 class="rec-card-title">{recommendation.title}</h3>
		<span class="movie-meta">{recommendation.genres ?? '—'}</span>
		<span class="movie-meta">{recommendation.director ?? '—'}</span>

		{#if recommendation.country}
			<span class="rec-card-meta">Country: {recommendation.country}</span>
		{/if}
		{#if recommendation.language}
			<span class="rec-card-meta">Language: {recommendation.language}</span>
		{/if}

		{#if recommendation.isIndependent}
			<span class="rec-badge-indie">Independent film</span>
		{/if}

		{#if recommendation.pitch}
			<p class="rec-card-pitch">{recommendation.pitch}</p>
		{/if}

		{#if recommendation.funFact}
			<p class="rec-card-fun-fact">{recommendation.funFact}</p>
		{/if}
	</div>
</article>
