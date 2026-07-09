import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchMovies } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		error(401, 'Unauthorized');
	}

	const q = event.url.searchParams.get('q')?.trim() ?? '';
	if (q.length < 2) {
		return json({ results: [] });
	}

	try {
		const results = await searchMovies(q);
		return json({ results });
	} catch (err) {
		console.error('TMDB search error:', err);
		error(502, 'Movie search unavailable');
	}
};
