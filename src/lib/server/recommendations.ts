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

type Movies = Awaited<ReturnType<typeof getMoviesByUser>>;
type Prefs = Awaited<ReturnType<typeof getUserPreferences>>;

type GenerationState = {
	status: 'pending' | 'failed';
	startedAt: number;
	error?: string;
};

const generationState = new Map<string, GenerationState>();
const inFlight = new Set<string>();

const PENDING_TIMEOUT_MS = 2 * 60 * 1000;
const FAILED_RETRY_COOLDOWN_MS = 30 * 1000;

export type GenerationStatus = 'idle' | 'pending' | 'failed';

export function canGenerateRecommendations(movies: Movies, prefs: Prefs): boolean {
	const diaryCount = movies.watched.length;
	const watchlistCount = movies.wantToWatch.length;
	const totalMovies = diaryCount + watchlistCount;
	const hasGenres = prefs.genres.length > 0;

	return diaryCount >= 3 || watchlistCount >= 3 || (hasGenres && totalMovies >= 1);
}

function isStalePending(state: GenerationState): boolean {
	return state.status === 'pending' && Date.now() - state.startedAt > PENDING_TIMEOUT_MS;
}

export function getGenerationStatus(userId: string): GenerationStatus {
	const state = generationState.get(userId);
	if (!state) return 'idle';
	if (isStalePending(state)) {
		generationState.delete(userId);
		return 'idle';
	}
	return state.status;
}

function clearGenerationState(userId: string): void {
	generationState.delete(userId);
}

function llmToFallbackItem(rec: LlmRecommendation, sortOrder: number): RecommendationItem {
	return {
		tmdbId: null,
		title: rec.title,
		posterPath: null,
		genres: null,
		director: null,
		country: rec.country,
		language: rec.language,
		isIndependent: rec.isIndependent,
		pitch: rec.pitch,
		funFact: rec.funFact,
		sortOrder
	};
}

async function enrichWithTmdb(
	llmResults: LlmRecommendation[],
	existingTmdbIds: Set<number>
): Promise<RecommendationItem[]> {
	const enriched: RecommendationItem[] = [];
	const seenTitles = new Set<string>();

	for (const rec of llmResults) {
		const titleKey = rec.title.toLowerCase().trim();
		if (seenTitles.has(titleKey)) continue;

		let item: RecommendationItem | null = null;

		try {
			const match = await findMovieByTitleYear(rec.title, rec.year);
			if (match && !existingTmdbIds.has(match.tmdbId)) {
				const details = await getMovieDetails(match.tmdbId);
				item = {
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
					sortOrder: enriched.length
				};
				existingTmdbIds.add(match.tmdbId);
			}
		} catch (err) {
			console.error('TMDB enrichment failed for', rec.title, err);
		}

		if (!item) {
			item = llmToFallbackItem(rec, enriched.length);
		}

		seenTitles.add(titleKey);
		enriched.push(item);
	}

	return enriched;
}

async function generateRecommendations(userId: string): Promise<RecommendationItem[]> {
	const [movies, prefs] = await Promise.all([getMoviesByUser(userId), getUserPreferences(userId)]);

	if (!canGenerateRecommendations(movies, prefs)) {
		return [];
	}

	const existingTmdbIds = new Set(
		[...movies.wantToWatch, ...movies.watched]
			.map((m) => m.tmdbId)
			.filter((id): id is number => id !== null)
	);

	const llmResults = await generateFilmRecommendations({ movies, prefs });
	if (llmResults.length === 0) {
		return [];
	}

	const enriched = await enrichWithTmdb(llmResults, existingTmdbIds);

	if (enriched.length > 0) {
		await saveRecommendations(userId, enriched);
	}

	return enriched;
}

export async function getRecommendationsForUser(userId: string): Promise<{
	recommendations: RecommendationItem[];
	gated: boolean;
}> {
	const [movies, prefs] = await Promise.all([getMoviesByUser(userId), getUserPreferences(userId)]);

	if (!canGenerateRecommendations(movies, prefs)) {
		return { recommendations: [], gated: true };
	}

	const cached = await getActiveRecommendations(userId);
	if (cached.length > 0) {
		return { recommendations: cached, gated: false };
	}

	const recommendations = await generateRecommendations(userId);
	return { recommendations, gated: false };
}

export async function refreshRecommendationsForUser(userId: string): Promise<RecommendationItem[]> {
	clearGenerationState(userId);
	await clearRecommendations(userId);
	return generateRecommendations(userId);
}

export function ensureRecommendationsGenerating(userId: string): void {
	const status = getGenerationStatus(userId);
	if (status === 'pending' || inFlight.has(userId)) {
		return;
	}

	if (status === 'failed') {
		const state = generationState.get(userId);
		if (state && Date.now() - state.startedAt < FAILED_RETRY_COOLDOWN_MS) {
			return;
		}
		clearGenerationState(userId);
	}

	generationState.set(userId, { status: 'pending', startedAt: Date.now() });
	inFlight.add(userId);

	generateRecommendations(userId)
		.then((items) => {
			clearGenerationState(userId);
			if (items.length === 0) {
				generationState.set(userId, {
					status: 'failed',
					startedAt: Date.now(),
					error: 'No recommendations could be generated'
				});
			}
		})
		.catch((err) => {
			console.error('Background recommendation generation failed for user', userId, err);
			generationState.set(userId, {
				status: 'failed',
				startedAt: Date.now(),
				error: err instanceof Error ? err.message : 'Failed to generate recommendations'
			});
		})
		.finally(() => {
			inFlight.delete(userId);
		});
}

export function retryRecommendationsGeneration(userId: string): void {
	clearGenerationState(userId);
	ensureRecommendationsGenerating(userId);
}
