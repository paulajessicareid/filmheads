<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import MovieListRow from '$lib/components/MovieListRow.svelte';
	import type { ListType } from '$lib/server/db/movies';

	type ViewMode = 'list' | 'card';

	type Movie = {
		id: number;
		title: string;
		posterPath: string | null;
		genres: string | null;
		director: string | null;
	};

	type SearchResult = {
		tmdbId: number;
		title: string;
		year: string | null;
		posterUrl: string | null;
	};

	let {
		title,
		movies,
		listType,
		message,
		emptyMessage = 'No movies yet'
	}: {
		title: string;
		movies: Movie[];
		listType: ListType;
		message?: string;
		emptyMessage?: string;
	} = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let searching = $state(false);
	let showResults = $state(false);
	let selectedTitle = $state('');
	let selectedTmdbId = $state('');
	let selectedPosterPath = $state('');
	let viewMode = $state<ViewMode>('list');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let formEl: HTMLFormElement | undefined;

	const viewStorageKey = $derived(`filmheads-view-${listType}`);

	$effect(() => {
		if (!browser) return;
		const stored = localStorage.getItem(viewStorageKey);
		if (stored === 'list' || stored === 'card') {
			viewMode = stored;
		}
	});

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
		if (browser) {
			localStorage.setItem(viewStorageKey, mode);
		}
	}

	async function runSearch(q: string) {
		if (q.trim().length < 2) {
			results = [];
			showResults = false;
			return;
		}

		searching = true;
		try {
			const response = await fetch(`/api/movies/search?q=${encodeURIComponent(q.trim())}`);
			if (!response.ok) {
				results = [];
				return;
			}
			const payload = (await response.json()) as { results: SearchResult[] };
			results = payload.results;
			showResults = true;
		} catch {
			results = [];
		} finally {
			searching = false;
		}
	}

	function onQueryInput(value: string) {
		query = value;
		selectedTitle = '';
		selectedTmdbId = '';
		selectedPosterPath = '';
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => runSearch(value), 300);
	}

	function selectMovie(movie: SearchResult) {
		selectedTitle = movie.title;
		selectedTmdbId = String(movie.tmdbId);
		selectedPosterPath = movie.posterUrl ?? '';
		query = movie.year ? `${movie.title} (${movie.year})` : movie.title;
		results = [];
		showResults = false;
		queueMicrotask(() => formEl?.requestSubmit());
	}
</script>

<div class="container">
	<section class="search-section">
		<h2>{title}</h2>
		<form
			method="post"
			action="?/addMovie"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					query = '';
					selectedTitle = '';
					selectedTmdbId = '';
					selectedPosterPath = '';
					results = [];
					showResults = false;
				};
			}}
			class="add-form"
			bind:this={formEl}
		>
			<input type="hidden" name="listType" value={listType} />
			<input type="hidden" name="title" value={selectedTitle} />
			<input type="hidden" name="tmdbId" value={selectedTmdbId} />
			<input type="hidden" name="posterPath" value={selectedPosterPath} />
			<div class="search-field">
				<input
					type="text"
					placeholder="Search for a movie…"
					autocomplete="off"
					value={query}
					oninput={(e) => onQueryInput(e.currentTarget.value)}
					onfocus={() => {
						if (results.length > 0) showResults = true;
					}}
				/>
				{#if showResults && (results.length > 0 || searching)}
					<ul class="search-results">
						{#if searching && results.length === 0}
							<li class="search-status">Searching…</li>
						{:else}
							{#each results as movie (movie.tmdbId)}
								<li>
									<button type="button" class="search-result" onclick={() => selectMovie(movie)}>
										{#if movie.posterUrl}
											<img src={movie.posterUrl} alt="" class="poster-thumb" width="40" height="60" />
										{:else}
											<span class="poster-placeholder" aria-hidden="true"></span>
										{/if}
										<span class="search-result-text">
											<span class="search-result-title">{movie.title}</span>
											{#if movie.year}
												<span class="search-result-year">{movie.year}</span>
											{/if}
										</span>
									</button>
								</li>
							{/each}
						{/if}
					</ul>
				{/if}
			</div>
		</form>
	</section>

	<section class="movies-section">
		<div class="movies-toolbar">
			<span class="movies-count">
				{movies.length} {movies.length === 1 ? 'movie' : 'movies'}
			</span>
			<div class="view-toggle" role="group" aria-label="View mode">
				<button
					type="button"
					class="view-toggle-btn"
					class:active={viewMode === 'list'}
					aria-pressed={viewMode === 'list'}
					aria-label="List view"
					onclick={() => setViewMode('list')}
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
					onclick={() => setViewMode('card')}
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

		{#if movies.length === 0}
			<p class="empty">{emptyMessage}</p>
		{:else if viewMode === 'list'}
			<ul class="movie-list">
				{#each movies as movie (movie.id)}
					<MovieListRow {movie} />
				{/each}
			</ul>
		{:else}
			<ul class="movie-card-grid">
				{#each movies as movie (movie.id)}
					<MovieCard {movie} />
				{/each}
			</ul>
		{/if}
	</section>

	{#if message}
		<p class="error">{message}</p>
	{/if}
</div>
