<script lang="ts">
	import { enhance } from '$app/forms';

	type Movie = {
		id: number;
		title: string;
		posterPath: string | null;
		genres: string | null;
		director: string | null;
	};

	let { movie }: { movie: Movie } = $props();
</script>

<li class="movie-list-row">
	{#if movie.posterPath}
		<img src={movie.posterPath} alt="" class="poster-list" width="80" height="120" />
	{:else}
		<span class="poster-placeholder poster-list" aria-hidden="true"></span>
	{/if}

	<div class="movie-list-info">
		<span class="movie-list-title">{movie.title}</span>
		<span class="movie-meta">{movie.genres ?? '—'}</span>
		<span class="movie-meta">{movie.director ?? '—'}</span>
	</div>

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
</li>
