import { env } from '$env/dynamic/private';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

export type TmdbSearchResult = {
	tmdbId: number;
	title: string;
	year: string | null;
	posterUrl: string | null;
};

type TmdbMovieResult = {
	id: number;
	title: string;
	release_date?: string;
	poster_path: string | null;
};

type TmdbSearchResponse = {
	results: TmdbMovieResult[];
};

export function posterUrl(path: string | null | undefined): string | null {
	if (!path) return null;
	return `${POSTER_BASE}${path}`;
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) {
		throw new Error('TMDB_API_KEY is not set');
	}

	const url = new URL(`${TMDB_API_BASE}/search/movie`);
	url.searchParams.set('query', query);
	url.searchParams.set('include_adult', 'false');

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			Accept: 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`TMDB search failed: ${response.status}`);
	}

	const data = (await response.json()) as TmdbSearchResponse;

	return data.results.slice(0, 10).map((movie) => ({
		tmdbId: movie.id,
		title: movie.title,
		year: movie.release_date ? movie.release_date.slice(0, 4) : null,
		posterUrl: posterUrl(movie.poster_path)
	}));
}
