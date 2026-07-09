import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { addMovie, getMoviesByUser } from '$lib/server/db/movies';
import type { ListType } from '$lib/server/db/movies';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const lists = await getMoviesByUser(event.locals.user.id);

	return {
		user: event.locals.user,
		wantToWatch: lists.wantToWatch,
		watched: lists.watched
	};
};

export const actions: Actions = {
	addMovie: async (event) => {
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

		await addMovie(event.locals.user.id, title, listType, tmdbId, posterPath);

		return { success: true };
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
