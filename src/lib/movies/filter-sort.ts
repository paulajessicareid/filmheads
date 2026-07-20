import type { Movie, SortBy } from '$lib/types/movie';

function createdAtMs(movie: Movie) {
	return new Date(movie.createdAt).getTime();
}

function genreList(genres: string | null): string[] {
	if (!genres) return [];
	return genres
		.split(/,\s*/)
		.map((g) => g.trim())
		.filter(Boolean);
}

export function filterAndSortMovies(
	movies: Movie[],
	{ genre, sortBy }: { genre: string; sortBy: SortBy }
): Movie[] {
	const filtered = genre
		? movies.filter((m) => genreList(m.genres).includes(genre))
		: [...movies];

	return filtered.toSorted((a, b) => {
		switch (sortBy) {
			case 'rating': {
				const aRating = a.rating ?? -1;
				const bRating = b.rating ?? -1;
				return bRating - aRating || a.title.localeCompare(b.title);
			}
			case 'az':
				return a.title.localeCompare(b.title);
			case 'year': {
				const aYear = a.releaseYear ?? -1;
				const bYear = b.releaseYear ?? -1;
				return bYear - aYear || a.title.localeCompare(b.title);
			}
			case 'oldest':
				return createdAtMs(a) - createdAtMs(b);
			case 'newest':
			default:
				return createdAtMs(b) - createdAtMs(a);
		}
	});
}
