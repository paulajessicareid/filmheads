import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCountryOptions } from '$lib/data/countries';
import { getAllLanguageOptions } from '$lib/data/languages';
import { requireUser } from '$lib/server/auth-guard';
import {
	addUserCountry,
	addUserLanguage,
	getUserPreferences,
	removeUserCountry,
	removeUserLanguage
} from '$lib/server/db/user-preferences';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const preferences = await getUserPreferences(user.id);

	return {
		user,
		preferences,
		countries: getCountryOptions(),
		languages: getAllLanguageOptions()
	};
};

export const actions: Actions = {
	addCountry: async (event) => {
		const user = requireUser(event);
		const formData = await event.request.formData();
		const countryCode = formData.get('countryCode')?.toString() ?? '';

		try {
			await addUserCountry(user.id, countryCode);
		} catch {
			return fail(400, { message: 'Invalid country' });
		}
	},
	removeCountry: async (event) => {
		const user = requireUser(event);
		const formData = await event.request.formData();
		const countryCode = formData.get('countryCode')?.toString() ?? '';

		if (!countryCode) {
			return fail(400, { message: 'Country is required' });
		}

		await removeUserCountry(user.id, countryCode);
	},
	addLanguage: async (event) => {
		const user = requireUser(event);
		const formData = await event.request.formData();
		const languageCode = formData.get('languageCode')?.toString() ?? '';

		try {
			await addUserLanguage(user.id, languageCode);
		} catch {
			return fail(400, { message: 'Invalid language' });
		}
	},
	removeLanguage: async (event) => {
		const user = requireUser(event);
		const formData = await event.request.formData();
		const languageCode = formData.get('languageCode')?.toString() ?? '';

		if (!languageCode) {
			return fail(400, { message: 'Language is required' });
		}

		await removeUserLanguage(user.id, languageCode);
	}
};
