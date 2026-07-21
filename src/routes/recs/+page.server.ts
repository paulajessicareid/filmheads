import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth-guard';
import {
	canGenerateRecommendations,
	ensureRecommendationsGenerating,
	getGenerationStatus,
	retryRecommendationsGeneration
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
		return { recommendations: [], gated: true, generating: false, generationFailed: false };
	}

	const cached = await getActiveRecommendations(user.id);
	if (cached.length > 0) {
		return { recommendations: cached, gated: false, generating: false, generationFailed: false };
	}

	const status = getGenerationStatus(user.id);
	if (status === 'failed') {
		return { recommendations: [], gated: false, generating: false, generationFailed: true };
	}

	if (status === 'pending') {
		return { recommendations: [], gated: false, generating: true, generationFailed: false };
	}

	ensureRecommendationsGenerating(user.id);
	return { recommendations: [], gated: false, generating: true, generationFailed: false };
};

export const actions: Actions = {
	addMovie: addMovieAction,
	retry: async (event) => {
		const user = requireUser(event);
		retryRecommendationsGeneration(user.id);
	}
};
