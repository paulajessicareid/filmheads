<script lang="ts">
	import { enhance } from '$app/forms';
	import DiaryRatingDisplay from '$lib/components/DiaryRatingDisplay.svelte';
	import type { ListType } from '$lib/server/db/movies';
	import type { Movie } from '$lib/types/movie';

	let {
		movie,
		listType,
		onOpenMovie
	}: {
		movie: Movie;
		listType: ListType;
		onOpenMovie?: (movie: Movie) => void;
	} = $props();

	const canOpen = $derived(!!onOpenMovie);
	const isDiary = $derived(listType === 'watched');
	const openAriaLabel = $derived(
		isDiary ? `Rate ${movie.title}` : `View details for ${movie.title}`
	);
</script>

<li class="movie-list-row">
	{#if canOpen}
		<button
			type="button"
			class="movie-open-trigger movie-open-poster"
			aria-label={openAriaLabel}
			onclick={() => onOpenMovie?.(movie)}
		>
			{#if movie.posterPath}
				<img src={movie.posterPath} alt="" class="poster-list" width="80" height="120" />
			{:else}
				<span class="poster-placeholder poster-list" aria-hidden="true"></span>
			{/if}
		</button>
	{:else if movie.posterPath}
		<img src={movie.posterPath} alt="" class="poster-list" width="80" height="120" />
	{:else}
		<span class="poster-placeholder poster-list" aria-hidden="true"></span>
	{/if}

	<div class="movie-list-info">
		{#if canOpen}
			<button
				type="button"
				class="movie-open-trigger movie-list-title"
				onclick={() => onOpenMovie?.(movie)}
			>
				{movie.title}{#if movie.releaseYear}
					<span class="movie-year"> ({movie.releaseYear})</span>{/if}
			</button>
			{#if isDiary}
				<DiaryRatingDisplay rating={movie.rating} />
			{/if}
		{:else}
			<span class="movie-list-title">
				{movie.title}{#if movie.releaseYear}
					<span class="movie-year"> ({movie.releaseYear})</span>{/if}
			</span>
		{/if}
		<span class="movie-meta">{movie.genres ?? '—'}</span>
		<span class="movie-meta">{movie.director ?? '—'}</span>
	</div>

	<div class="movie-actions">
		{#if listType === 'want_to_watch'}
			<form method="post" action="?/moveToDiary" use:enhance class="movie-move-form">
				<input type="hidden" name="movieId" value={movie.id} />
				<button type="submit" class="btn-move-diary" aria-label="Add {movie.title} to diary">
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
						<path d="M5 12h14" />
						<path d="M12 5v14" />
					</svg>
				</button>
			</form>
			<form method="post" action="?/toggleFavourite" use:enhance class="movie-fav-form">
				<input type="hidden" name="movieId" value={movie.id} />
				<button
					type="submit"
					class="btn-favourite"
					class:active={movie.favourite}
					aria-label={movie.favourite ? `Unfavourite ${movie.title}` : `Favourite ${movie.title}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill={movie.favourite ? 'currentColor' : 'none'}
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
				</button>
			</form>
		{/if}

		<form method="post" action="?/removeMovie" use:enhance class="movie-delete-form">
			<input type="hidden" name="movieId" value={movie.id} />
			<button type="submit" class="btn-delete" aria-label="Remove {movie.title}">
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
					<path d="M3 6h18" />
					<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
					<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
				</svg>
			</button>
		</form>
	</div>
</li>
