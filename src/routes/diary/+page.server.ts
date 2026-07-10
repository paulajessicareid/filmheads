import type { Actions, PageServerLoad } from './$types';
import { addMovieAction } from '$lib/server/actions/add-movie';
import { removeMovieAction } from '$lib/server/actions/remove-movie';
import { requireUser } from '$lib/server/auth-guard';
import { getMoviesByUser } from '$lib/server/db/movies';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const lists = await getMoviesByUser(user.id);

	return {
		watched: lists.watched
	};
};

export const actions: Actions = {
	addMovie: addMovieAction,
	removeMovie: removeMovieAction
};
