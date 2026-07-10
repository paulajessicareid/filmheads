import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth-guard';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	return {};
};
