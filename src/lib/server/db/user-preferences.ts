import { and, eq } from 'drizzle-orm';
import { isValidCountryCode } from '$lib/data/countries';
import { isValidGenre } from '$lib/data/genres';
import { isValidLanguageCode } from '$lib/data/languages';
import { db } from './index';
import { userCountry, userGenre, userLanguage } from './schema';

const MAX_INITIAL_GENRES = 4;

export async function getUserPreferences(userId: string) {
	const [countries, languages, genres] = await Promise.all([
		db
			.select({ code: userCountry.countryCode })
			.from(userCountry)
			.where(eq(userCountry.userId, userId)),
		db
			.select({ code: userLanguage.languageCode })
			.from(userLanguage)
			.where(eq(userLanguage.userId, userId)),
		db.select({ genre: userGenre.genre }).from(userGenre).where(eq(userGenre.userId, userId))
	]);

	return {
		countries: countries.map((row) => row.code),
		languages: languages.map((row) => row.code),
		genres: genres.map((row) => row.genre)
	};
}

export async function addUserCountry(userId: string, countryCode: string) {
	if (!isValidCountryCode(countryCode)) {
		throw new Error('Invalid country code');
	}

	await db.insert(userCountry).values({ userId, countryCode }).onConflictDoNothing();
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

	await db.insert(userLanguage).values({ userId, languageCode }).onConflictDoNothing();
}

export async function removeUserLanguage(userId: string, languageCode: string) {
	await db
		.delete(userLanguage)
		.where(and(eq(userLanguage.userId, userId), eq(userLanguage.languageCode, languageCode)));
}

export async function addUserGenre(userId: string, genre: string) {
	if (!isValidGenre(genre)) {
		throw new Error('Invalid genre');
	}

	await db.insert(userGenre).values({ userId, genre }).onConflictDoNothing();
}

export async function removeUserGenre(userId: string, genre: string) {
	await db
		.delete(userGenre)
		.where(and(eq(userGenre.userId, userId), eq(userGenre.genre, genre)));
}

export async function setInitialPreferences(
	userId: string,
	options: {
		countryCode?: string;
		languageCode?: string;
		genres?: string[];
	} = {}
) {
	const { countryCode, languageCode, genres = [] } = options;

	if (countryCode) {
		await addUserCountry(userId, countryCode);
	}
	if (languageCode) {
		await addUserLanguage(userId, languageCode);
	}

	const uniqueGenres = [...new Set(genres.filter(isValidGenre))].slice(0, MAX_INITIAL_GENRES);
	for (const genre of uniqueGenres) {
		await addUserGenre(userId, genre);
	}
}
