<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ListType } from '$lib/server/db/movies';
	import type { MovieSearchResult } from '$lib/types/movie';

	let {
		listType,
		message
	}: {
		listType: ListType;
		message?: string;
	} = $props();

	let query = $state('');
	let results = $state<MovieSearchResult[]>([]);
	let searching = $state(false);
	let showResults = $state(false);
	let selectedTitle = $state('');
	let selectedTmdbId = $state('');
	let selectedPosterPath = $state('');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let formEl: HTMLFormElement | undefined;

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
			const payload = (await response.json()) as { results: MovieSearchResult[] };
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

	function selectMovie(movie: MovieSearchResult) {
		selectedTitle = movie.title;
		selectedTmdbId = String(movie.tmdbId);
		selectedPosterPath = movie.posterUrl ?? '';
		query = movie.year ? `${movie.title} (${movie.year})` : movie.title;
		results = [];
		showResults = false;
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function resetSearch() {
		query = '';
		selectedTitle = '';
		selectedTmdbId = '';
		selectedPosterPath = '';
		results = [];
		showResults = false;
	}
</script>

<section class="search-section">
	{#if message}
		<p class="error">{message}</p>
	{/if}
	<form
		method="post"
		action="?/addMovie"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				resetSearch();
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
