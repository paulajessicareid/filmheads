import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth-guard';
import {
	canGenerateRecommendations,
	getRecommendationsForUser,
	generateRecommendationsInBackground
} from '$lib/server/recommendations';
import { getActiveRecommendations } from '$lib/server/db/recommendations';
import { getMoviesByUser } from '$lib/server/db/movies';
import { getUserPreferences } from '$lib/server/db/user-preferences';
import { addMovieAction } from '$lib/server/actions/add-movie';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);

	const [movies, prefs] = await Promise.all([
		getMoviesByUser(user.id),
		getUserPreferences(user.id)
	]);

	if (!canGenerateRecommendations(movies, prefs)) {
		return { recommendations: [], gated: true, generating: false };
	}

	const cached = await getActiveRecommendations(user.id);
	if (cached.length > 0) {
		return { recommendations: cached, gated: false, generating: false };
	}

	// Kick off generation in the background — don't block the page load
	generateRecommendationsInBackground(user.id);

	return { recommendations: [], gated: false, generating: true };
};

export const actions: Actions = {
	addMovie: addMovieAction
};
