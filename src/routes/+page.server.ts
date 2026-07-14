import type { Actions, PageServerLoad } from './$types';
import { addMovieAction } from '$lib/server/actions/add-movie';
import { removeMovieAction } from '$lib/server/actions/remove-movie';
import { toggleFavouriteAction } from '$lib/server/actions/toggle-favourite';
import { requireUser } from '$lib/server/auth-guard';
import { getMoviesByUser } from '$lib/server/db/movies';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const lists = await getMoviesByUser(user.id);

	return {
		wantToWatch: lists.wantToWatch
	};
};

export const actions: Actions = {
	addMovie: addMovieAction,
	removeMovie: removeMovieAction,
	toggleFavourite: toggleFavouriteAction
};
