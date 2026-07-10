import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { addMovie } from '$lib/server/db/movies';
import type { ListType } from '$lib/server/db/movies';
import { getMovieDetails } from '$lib/server/tmdb';

export async function addMovieAction(event: RequestEvent) {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const formData = await event.request.formData();
	const title = formData.get('title')?.toString().trim() ?? '';
	const listType = formData.get('listType')?.toString() as ListType;
	const tmdbIdRaw = formData.get('tmdbId')?.toString().trim() ?? '';
	const posterPathRaw = formData.get('posterPath')?.toString().trim() ?? '';

	if (!title) {
		return fail(400, { message: 'Title is required' });
	}

	if (listType !== 'want_to_watch' && listType !== 'watched') {
		return fail(400, { message: 'Invalid list type' });
	}

	const tmdbId = Number.parseInt(tmdbIdRaw, 10);
	if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
		return fail(400, { message: 'Select a movie from the search results' });
	}

	const posterPath = posterPathRaw || null;
	if (posterPath && !posterPath.startsWith('https://image.tmdb.org/')) {
		return fail(400, { message: 'Invalid poster URL' });
	}

	let genres: string | null = null;
	let director: string | null = null;

	try {
		const details = await getMovieDetails(tmdbId);
		genres = details.genres;
		director = details.director;
	} catch {
		return fail(502, { message: 'Could not fetch movie details. Try again.' });
	}

	await addMovie(event.locals.user.id, title, listType, tmdbId, posterPath, genres, director);

	return { success: true };
}
