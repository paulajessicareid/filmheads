import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { backfillMovieDetails } from '$lib/server/db/movies';
import { getMovieDetails } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		error(401, 'Unauthorized');
	}

	const tmdbIdRaw = event.url.searchParams.get('tmdbId')?.trim() ?? '';
	const movieIdRaw = event.url.searchParams.get('movieId')?.trim() ?? '';
	const tmdbId = Number.parseInt(tmdbIdRaw, 10);
	const movieId = Number.parseInt(movieIdRaw, 10);

	if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
		error(400, 'Invalid tmdbId');
	}

	try {
		const details = await getMovieDetails(tmdbId);

		if (Number.isInteger(movieId) && movieId > 0) {
			await backfillMovieDetails(event.locals.user.id, movieId, {
				releaseYear: details.releaseYear,
				overview: details.overview,
				cast: details.cast,
				genres: details.genres,
				director: details.director
			});
		}

		return json({
			overview: details.overview,
			releaseYear: details.releaseYear,
			cast: details.cast
		});
	} catch (err) {
		console.error('TMDB details error:', err);
		error(502, 'Movie details unavailable');
	}
};
