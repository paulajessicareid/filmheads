import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth-guard';
import { getRecommendationsForUser } from '$lib/server/recommendations';
import { addMovieAction } from '$lib/server/actions/add-movie';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);

	try {
		const { recommendations, gated } = await getRecommendationsForUser(user.id);
		return { recommendations, gated, error: null };
	} catch (err) {
		console.error('Failed to load recommendations:', err);
		return {
			recommendations: [],
			gated: false,
			error: err instanceof Error ? err.message : 'Failed to generate recommendations'
		};
	}
};

export const actions: Actions = {
	addMovie: addMovieAction
};
