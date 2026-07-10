import { and, eq } from 'drizzle-orm';
import { isValidCountryCode } from '$lib/data/countries';
import { isValidLanguageCode } from '$lib/data/languages';
import { db } from './index';
import { userCountry, userLanguage } from './schema';

export async function getUserPreferences(userId: string) {
	const [countries, languages] = await Promise.all([
		db
			.select({ code: userCountry.countryCode })
			.from(userCountry)
			.where(eq(userCountry.userId, userId)),
		db
			.select({ code: userLanguage.languageCode })
			.from(userLanguage)
			.where(eq(userLanguage.userId, userId))
	]);

	return {
		countries: countries.map((row) => row.code),
		languages: languages.map((row) => row.code)
	};
}

export async function addUserCountry(userId: string, countryCode: string) {
	if (!isValidCountryCode(countryCode)) {
		throw new Error('Invalid country code');
	}

	await db
		.insert(userCountry)
		.values({ userId, countryCode })
		.onConflictDoNothing();
}

export async function removeUserCountry(userId: string, countryCode: string) {
	await db
		.delete(userCountry)
		.where(and(eq(userCountry.userId, userId), eq(userCountry.countryCode, countryCode)));
}

export async function addUserLanguage(userId: string, languageCode: string) {
	if (!isValidLanguageCode(languageCode)) {
		throw new Error('Invalid language code');
	}

	await db
		.insert(userLanguage)
		.values({ userId, languageCode })
		.onConflictDoNothing();
}

export async function removeUserLanguage(userId: string, languageCode: string) {
	await db
		.delete(userLanguage)
		.where(
			and(eq(userLanguage.userId, userId), eq(userLanguage.languageCode, languageCode))
		);
}

export async function setInitialPreferences(
	userId: string,
	countryCode?: string,
	languageCode?: string
) {
	if (countryCode) {
		await addUserCountry(userId, countryCode);
	}
	if (languageCode) {
		await addUserLanguage(userId, languageCode);
	}
}
