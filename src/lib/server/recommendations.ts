import {
	clearRecommendations,
	getActiveRecommendations,
	saveRecommendations,
	type RecommendationItem
} from '$lib/server/db/recommendations';
import { getMoviesByUser } from '$lib/server/db/movies';
import { getUserPreferences } from '$lib/server/db/user-preferences';
import { generateFilmRecommendations, type LlmRecommendation } from '$lib/server/openai';
import { findMovieByTitleYear, getMovieDetails } from '$lib/server/tmdb';

async function enrichWithTmdb(
	llmResults: LlmRecommendation[],
	existingTmdbIds: Set<number>
): Promise<RecommendationItem[]> {
	const enriched: RecommendationItem[] = [];

	for (let i = 0; i < llmResults.length; i++) {
		const rec = llmResults[i];
		const match = await findMovieByTitleYear(rec.title, rec.year);
		if (!match) continue;
		if (existingTmdbIds.has(match.tmdbId)) continue;

		const details = await getMovieDetails(match.tmdbId);

		enriched.push({
			tmdbId: match.tmdbId,
			title: match.title,
			posterPath: match.posterUrl,
			genres: details.genres,
			director: details.director,
			country: rec.country || details.originCountry,
			language: rec.language || details.spokenLanguages,
			isIndependent: rec.isIndependent,
			pitch: rec.pitch,
			funFact: rec.funFact,
			sortOrder: i
		});

		existingTmdbIds.add(match.tmdbId);
	}

	return enriched;
}

async function generateRecommendations(userId: string): Promise<RecommendationItem[]> {
	const [movies, prefs] = await Promise.all([getMoviesByUser(userId), getUserPreferences(userId)]);

	const existingTmdbIds = new Set(
		[...movies.wantToWatch, ...movies.watched]
			.map((m) => m.tmdbId)
			.filter((id): id is number => id !== null)
	);

	const llmResults = await generateFilmRecommendations({ movies, prefs });
	const enriched = await enrichWithTmdb(llmResults, existingTmdbIds);

	if (enriched.length > 0) {
		await saveRecommendations(userId, enriched);
	}

	return enriched;
}

export async function getRecommendationsForUser(userId: string): Promise<RecommendationItem[]> {
	const cached = await getActiveRecommendations(userId);
	if (cached.length > 0) return cached;

	return generateRecommendations(userId);
}

export async function refreshRecommendationsForUser(userId: string): Promise<RecommendationItem[]> {
	await clearRecommendations(userId);
	return generateRecommendations(userId);
}
