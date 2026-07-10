import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth-guard';
import { getRecommendationsForUser } from '$lib/server/recommendations';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);

	try {
		const recommendations = await getRecommendationsForUser(user.id);
		return { recommendations, error: null };
	} catch (err) {
		console.error('Failed to load recommendations:', err);
		return {
			recommendations: [],
			error: err instanceof Error ? err.message : 'Failed to generate recommendations'
		};
	}
};
