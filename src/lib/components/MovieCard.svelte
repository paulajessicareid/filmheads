<script lang="ts">
	import { enhance } from '$app/forms';
	import DiaryRatingDisplay from '$lib/components/DiaryRatingDisplay.svelte';
	import type { ListType } from '$lib/server/db/movies';

	type Movie = {
		id: number;
		title: string;
		posterPath: string | null;
		genres: string | null;
		director: string | null;
		favourite: boolean;
		rating: number | null;
		comment: string | null;
		watchedAt: Date | string | null;
	};

	let {
		movie,
		listType,
		onOpenDiary
	}: {
		movie: Movie;
		listType: ListType;
		onOpenDiary?: (movie: Movie) => void;
	} = $props();

	const isDiary = $derived(listType === 'watched' && !!onOpenDiary);
</script>

<li class="movie-card">
	<div class="movie-card-poster-wrap">
		{#if isDiary}
			<button
				type="button"
				class="movie-open-trigger movie-open-poster"
				aria-label="Rate {movie.title}"
				onclick={() => onOpenDiary?.(movie)}
			>
				{#if movie.posterPath}
					<img src={movie.posterPath} alt="" class="poster-card" />
				{:else}
					<span class="poster-placeholder poster-card" aria-hidden="true"></span>
				{/if}
			</button>
		{:else if movie.posterPath}
			<img src={movie.posterPath} alt="" class="poster-card" />
		{:else}
			<span class="poster-placeholder poster-card" aria-hidden="true"></span>
		{/if}

		<div class="movie-card-actions">
			{#if listType === 'want_to_watch'}
				<form method="post" action="?/toggleFavourite" use:enhance class="movie-fav-form">
					<input type="hidden" name="movieId" value={movie.id} />
					<button
						type="submit"
						class="btn-favourite btn-card-overlay"
						class:active={movie.favourite}
						aria-label={movie.favourite ? `Unfavourite ${movie.title}` : `Favourite ${movie.title}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
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

			<form method="post" action="?/removeMovie" use:enhance class="movie-delete-form movie-card-delete">
				<input type="hidden" name="movieId" value={movie.id} />
				<button type="submit" class="btn-delete" aria-label="Remove {movie.title}">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
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
	</div>

	<div class="movie-card-info">
		{#if isDiary}
			<button
				type="button"
				class="movie-open-trigger movie-card-title"
				onclick={() => onOpenDiary?.(movie)}
			>
				{movie.title}
			</button>
			<DiaryRatingDisplay rating={movie.rating} />
		{:else}
			<span class="movie-card-title">{movie.title}</span>
		{/if}
		<span class="movie-meta">{movie.genres ?? '—'}</span>
		<span class="movie-meta">{movie.director ?? '—'}</span>
	</div>
</li>
