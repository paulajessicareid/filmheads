import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCountryOptions } from '$lib/data/countries';
import { GENRES, isValidGenre } from '$lib/data/genres';
import { getCommonLanguageOptions } from '$lib/data/languages';
import { requireUser } from '$lib/server/auth-guard';
import {
	addUserCountry,
	addUserGenre,
	addUserLanguage
} from '$lib/server/db/user-preferences';

export const load: PageServerLoad = async (event) => {
	requireUser(event);

	return {
		genres: GENRES,
		countries: getCountryOptions(),
		commonLanguages: getCommonLanguageOptions()
	};
};

export const actions: Actions = {
	save: async (event) => {
		const user = requireUser(event);
		const formData = await event.request.formData();
		const countryCode = formData.get('country')?.toString().trim() || undefined;
		const languageCode = formData.get('language')?.toString().trim() || undefined;
		const genres = [
			...new Set(
				formData
					.getAll('genres')
					.map((value) => value.toString())
					.filter(isValidGenre)
			)
		].slice(0, 4);

		try {
			// Genres can be saved on their own — country and language are optional.
			for (const genre of genres) {
				await addUserGenre(user.id, genre);
			}
			if (countryCode) {
				await addUserCountry(user.id, countryCode);
			}
			if (languageCode) {
				await addUserLanguage(user.id, languageCode);
			}
		} catch {
			return fail(500, { message: 'Could not save your preferences' });
		}

		return redirect(302, '/');
	}
};
