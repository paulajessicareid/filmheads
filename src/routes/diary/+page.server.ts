import type { Actions, PageServerLoad } from './$types';
import { addMovieAction } from '$lib/server/actions/add-movie';
import { removeMovieAction } from '$lib/server/actions/remove-movie';
import { updateDiaryEntryAction } from '$lib/server/actions/update-diary-entry';
import { requireUser } from '$lib/server/auth-guard';
import { getMoviesByUser } from '$lib/server/db/movies';
import { getUserPreferences } from '$lib/server/db/user-preferences';
import { getFirstRunGuidanceMessage } from '$lib/server/first-run-guidance';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const [lists, prefs] = await Promise.all([
		getMoviesByUser(user.id),
		getUserPreferences(user.id)
	]);

	return {
		watched: lists.watched,
		guidanceMessage: getFirstRunGuidanceMessage(lists, prefs)
	};
};

export const actions: Actions = {
	addMovie: addMovieAction,
	removeMovie: removeMovieAction,
	updateDiaryEntry: updateDiaryEntryAction
};
