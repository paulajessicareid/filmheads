import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from './index';
import { fhRecommendation } from './schema';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type RecommendationItem = {
	tmdbId: number | null;
	title: string;
	posterPath: string | null;
	genres: string | null;
	director: string | null;
	country: string | null;
	language: string | null;
	isIndependent: boolean;
	pitch: string | null;
	funFact: string | null;
	sortOrder: number;
};

export async function getActiveRecommendations(userId: string): Promise<RecommendationItem[]> {
	const cutoff = new Date(Date.now() - CACHE_TTL_MS);

	const latestBatch = await db
		.select({ batchGeneratedAt: fhRecommendation.batchGeneratedAt })
		.from(fhRecommendation)
		.where(and(eq(fhRecommendation.userId, userId), gt(fhRecommendation.batchGeneratedAt, cutoff)))
		.orderBy(desc(fhRecommendation.batchGeneratedAt))
		.limit(1);

	if (latestBatch.length === 0) {
		return [];
	}

	const batchAt = latestBatch[0].batchGeneratedAt;

	const rows = await db
		.select()
		.from(fhRecommendation)
		.where(and(eq(fhRecommendation.userId, userId), eq(fhRecommendation.batchGeneratedAt, batchAt)))
		.orderBy(fhRecommendation.sortOrder);

	return rows.map((row) => ({
		tmdbId: row.tmdbId,
		title: row.title,
		posterPath: row.posterPath,
		genres: row.genres,
		director: row.director,
		country: row.country,
		language: row.language,
		isIndependent: row.isIndependent,
		pitch: row.pitch,
		funFact: row.funFact,
		sortOrder: row.sortOrder
	}));
}

export async function saveRecommendations(
	userId: string,
	items: RecommendationItem[]
): Promise<void> {
	await db.delete(fhRecommendation).where(eq(fhRecommendation.userId, userId));

	if (items.length === 0) {
		return;
	}

	const batchGeneratedAt = new Date();

	await db.insert(fhRecommendation).values(
		items.map((item, index) => ({
			userId,
			batchGeneratedAt,
			tmdbId: item.tmdbId,
			title: item.title,
			posterPath: item.posterPath,
			genres: item.genres,
			director: item.director,
			country: item.country,
			language: item.language,
			isIndependent: item.isIndependent,
			pitch: item.pitch,
			funFact: item.funFact,
			sortOrder: item.sortOrder ?? index
		}))
	);
}

export async function clearRecommendations(userId: string): Promise<void> {
	await db.delete(fhRecommendation).where(eq(fhRecommendation.userId, userId));
}
