<script lang="ts">
	import { GENRES } from '$lib/data/genres';
	import type { SortBy, ViewMode } from '$lib/types/movie';

	let {
		count,
		selectedGenre = $bindable(''),
		sortBy = $bindable('newest' as SortBy),
		viewMode,
		showRatingSort = false,
		onViewModeChange
	}: {
		count: number;
		selectedGenre?: string;
		sortBy?: SortBy;
		viewMode: ViewMode;
		showRatingSort?: boolean;
		onViewModeChange: (mode: ViewMode) => void;
	} = $props();
</script>

<div class="movies-toolbar">
	<select class="genre-filter" bind:value={selectedGenre} aria-label="Filter by genre">
		<option value="">All Genres</option>
		{#each GENRES as genre}
			<option value={genre}>{genre}</option>
		{/each}
	</select>
	<select class="genre-filter" bind:value={sortBy} aria-label="Sort movies">
		{#if showRatingSort}
			<option value="rating">By rating</option>
		{/if}
		<option value="az">A–Z</option>
		<option value="year">By year</option>
		<option value="newest">Newest added</option>
		<option value="oldest">Oldest added</option>
	</select>
</div>
<div class="movies-toolbar">
	<span class="movies-count">
		{count} {count === 1 ? 'movie' : 'movies'}
	</span>
	<div class="view-toggle" role="group" aria-label="View mode">
		<button
			type="button"
			class="view-toggle-btn"
			class:active={viewMode === 'list'}
			aria-pressed={viewMode === 'list'}
			aria-label="List view"
			onclick={() => onViewModeChange('list')}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="8" y1="6" x2="21" y2="6" />
				<line x1="8" y1="12" x2="21" y2="12" />
				<line x1="8" y1="18" x2="21" y2="18" />
				<line x1="3" y1="6" x2="3.01" y2="6" />
				<line x1="3" y1="12" x2="3.01" y2="12" />
				<line x1="3" y1="18" x2="3.01" y2="18" />
			</svg>
		</button>
		<button
			type="button"
			class="view-toggle-btn"
			class:active={viewMode === 'card'}
			aria-pressed={viewMode === 'card'}
			aria-label="Card view"
			onclick={() => onViewModeChange('card')}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
			</svg>
		</button>
	</div>
</div>
