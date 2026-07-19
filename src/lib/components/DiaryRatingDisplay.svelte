<script lang="ts">
	let { rating }: { rating: number | null } = $props();

	const value = $derived(rating ?? 0);
	const label = $derived(
		value > 0 ? `Rated ${value} out of 5 stars` : 'Not rated yet'
	);
</script>

<span class="diary-rating" aria-label={label}>
	{#each [1, 2, 3, 4, 5] as star (star)}
		<svg
			class="diary-rating-star"
			class:filled={star <= value}
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill={star <= value ? 'currentColor' : 'none'}
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polygon
				points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
			/>
		</svg>
	{/each}
</span>
