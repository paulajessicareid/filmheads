<script lang="ts">
	import DiaryEntryOverlay from '$lib/components/DiaryEntryOverlay.svelte';
	import FirstRunGuidance from '$lib/components/FirstRunGuidance.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import MovieListRow from '$lib/components/MovieListRow.svelte';
	import MovieSearchAdd from '$lib/components/MovieSearchAdd.svelte';
	import MoviesToolbar from '$lib/components/MoviesToolbar.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { filterAndSortMovies } from '$lib/movies/filter-sort';
	import { loadViewMode, saveViewMode } from '$lib/movies/view-mode';
	import type { ListType } from '$lib/server/db/movies';
	import type { Movie, SortBy, ViewMode } from '$lib/types/movie';

	let {
		title,
		subtitle,
		movies,
		listType,
		message,
		emptyMessage = 'No movies yet',
		guidanceMessage = null
	}: {
		title: string;
		subtitle: string;
		movies: Movie[];
		listType: ListType;
		message?: string;
		emptyMessage?: string;
		guidanceMessage?: string | null;
	} = $props();

	let viewMode = $state<ViewMode>('list');
	let selectedGenre = $state('');
	let sortBy = $state<SortBy>('newest');
	let selectedMovie = $state<Movie | null>(null);
	let guidanceDismissed = $state(false);

	const isDiary = $derived(listType === 'watched');
	const showGuidance = $derived(!!guidanceMessage && !guidanceDismissed);
	const filteredMovies = $derived(
		filterAndSortMovies(movies, { genre: selectedGenre, sortBy })
	);

	$effect(() => {
		viewMode = loadViewMode(listType);
	});

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
		saveViewMode(listType, mode);
	}

	function openDiary(movie: Movie) {
		selectedMovie = movie;
	}

	function closeDiary() {
		selectedMovie = null;
	}
</script>

<PageHeader {title} {subtitle} />

<div class="container">
	<MovieSearchAdd {listType} {message} />

	<section class="movies-section">
		<MoviesToolbar
			count={filteredMovies.length}
			bind:selectedGenre
			bind:sortBy
			{viewMode}
			showRatingSort={isDiary}
			onViewModeChange={setViewMode}
		/>

		{#if guidanceMessage}
			<FirstRunGuidance message={guidanceMessage} onDismiss={() => (guidanceDismissed = true)} />
		{/if}

		{#if movies.length === 0}
			{#if !showGuidance}
				<p class="empty">{emptyMessage}</p>
			{/if}
		{:else if filteredMovies.length === 0}
			<p class="empty">No movies match this genre</p>
		{:else if viewMode === 'list'}
			<ul class="movie-list">
				{#each filteredMovies as movie (movie.id)}
					<MovieListRow {movie} {listType} onOpenDiary={isDiary ? openDiary : undefined} />
				{/each}
			</ul>
		{:else}
			<ul class="movie-card-grid">
				{#each filteredMovies as movie (movie.id)}
					<MovieCard {movie} {listType} onOpenDiary={isDiary ? openDiary : undefined} />
				{/each}
			</ul>
		{/if}
	</section>
</div>

{#if isDiary && selectedMovie}
	{#key selectedMovie.id}
		<DiaryEntryOverlay movie={selectedMovie} onClose={closeDiary} />
	{/key}
{/if}
