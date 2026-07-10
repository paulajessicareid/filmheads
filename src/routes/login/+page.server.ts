import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCountryOptions } from '$lib/data/countries';
import { getCommonLanguageOptions } from '$lib/data/languages';
import { auth } from '$lib/server/auth';
import { setInitialPreferences } from '$lib/server/db/user-preferences';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	return {
		countries: getCountryOptions(),
		commonLanguages: getCommonLanguageOptions()
	};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: { email, password },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const countryCode = formData.get('country')?.toString() ?? '';
		const languageCode = formData.get('language')?.toString() ?? '';

		let userId: string;

		try {
			const result = await auth.api.signUpEmail({
				body: { email, password, name },
				headers: event.request.headers
			});
			userId = result.user.id;
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		try {
			await setInitialPreferences(
				userId,
				countryCode || undefined,
				languageCode || undefined
			);
		} catch {
			return fail(500, { message: 'Account created but preferences could not be saved' });
		}

		return redirect(302, '/');
	}
};
