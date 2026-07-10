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

<li class="movie-card">
	<div class="movie-card-poster-wrap">
		{#if movie.posterPath}
			<img src={movie.posterPath} alt="" class="poster-card" />
		{:else}
			<span class="poster-placeholder poster-card" aria-hidden="true"></span>
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

	<div class="movie-card-info">
		<span class="movie-card-title">{movie.title}</span>
		<span class="movie-meta">{movie.genres ?? '—'}</span>
		<span class="movie-meta">{movie.director ?? '—'}</span>
	</div>
</li>
