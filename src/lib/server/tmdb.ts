import { env } from '$env/dynamic/private';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

export type TmdbSearchResult = {
	tmdbId: number;
	title: string;
	year: string | null;
	posterUrl: string | null;
};

export type TmdbMovieDetails = {
	genres: string | null;
	director: string | null;
	originCountry: string | null;
	spokenLanguages: string | null;
};

export type TmdbMovieMatch = {
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

type TmdbGenre = {
	id: number;
	name: string;
};

type TmdbMovieDetailsResponse = {
	genres: TmdbGenre[];
	origin_country?: string[];
	spoken_languages?: { english_name: string }[];
};

type TmdbCrewMember = {
	job: string;
	name: string;
};

type TmdbCreditsResponse = {
	crew: TmdbCrewMember[];
};

function tmdbHeaders(apiKey: string): HeadersInit {
	return {
		Authorization: `Bearer ${apiKey}`,
		Accept: 'application/json'
	};
}

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
		headers: tmdbHeaders(apiKey)
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

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) {
		throw new Error('TMDB_API_KEY is not set');
	}

	const headers = tmdbHeaders(apiKey);
	const [detailsResponse, creditsResponse] = await Promise.all([
		fetch(`${TMDB_API_BASE}/movie/${tmdbId}`, { headers }),
		fetch(`${TMDB_API_BASE}/movie/${tmdbId}/credits`, { headers })
	]);

	if (!detailsResponse.ok || !creditsResponse.ok) {
		throw new Error(`TMDB details failed: ${detailsResponse.status}/${creditsResponse.status}`);
	}

	const details = (await detailsResponse.json()) as TmdbMovieDetailsResponse;
	const credits = (await creditsResponse.json()) as TmdbCreditsResponse;

	const genres =
		details.genres.length > 0 ? details.genres.map((genre) => genre.name).join(', ') : null;
	const director = credits.crew.find((member) => member.job === 'Director')?.name ?? null;
	const originCountry =
		details.origin_country && details.origin_country.length > 0
			? details.origin_country.join(', ')
			: null;
	const spokenLanguages =
		details.spoken_languages && details.spoken_languages.length > 0
			? details.spoken_languages.map((lang) => lang.english_name).join(', ')
			: null;

	return { genres, director, originCountry, spokenLanguages };
}

export async function findMovieByTitleYear(
	title: string,
	year: number
): Promise<TmdbMovieMatch | null> {
	const results = await searchMovies(title);
	if (results.length === 0) return null;

	const normalizedTitle = title.toLowerCase().trim();

	const scored = results.map((result) => {
		const resultYear = result.year ? parseInt(result.year, 10) : null;
		const titleMatch = result.title.toLowerCase().trim() === normalizedTitle ? 10 : 0;
		const titleContains =
			result.title.toLowerCase().includes(normalizedTitle) ||
			normalizedTitle.includes(result.title.toLowerCase())
				? 5
				: 0;
		const yearDiff = resultYear !== null ? Math.max(0, 5 - Math.abs(resultYear - year)) : 0;
		return { result, score: titleMatch + titleContains + yearDiff };
	});

	scored.sort((a, b) => b.score - a.score);

	const best = scored[0];
	if (!best || best.score === 0) return null;

	return {
		tmdbId: best.result.tmdbId,
		title: best.result.title,
		year: best.result.year,
		posterUrl: best.result.posterUrl
	};
}
