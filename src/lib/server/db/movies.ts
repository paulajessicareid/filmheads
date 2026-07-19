import { and, desc, eq } from 'drizzle-orm';
import { db } from './index';
import { movieListItem } from './schema';

export type ListType = 'want_to_watch' | 'watched';

export async function getMoviesByUser(userId: string) {
	const items = await db
		.select()
		.from(movieListItem)
		.where(eq(movieListItem.userId, userId))
		.orderBy(desc(movieListItem.favourite), desc(movieListItem.createdAt));

	return {
		wantToWatch: items.filter((item) => item.listType === 'want_to_watch'),
		watched: items.filter((item) => item.listType === 'watched')
	};
}

export async function addMovie(
	userId: string,
	title: string,
	listType: ListType,
	tmdbId: number,
	posterPath: string | null,
	genres: string | null,
	director: string | null
) {
	await db
		.insert(movieListItem)
		.values({ userId, title, listType, tmdbId, posterPath, genres, director });
}

export async function removeMovie(userId: string, movieId: number) {
	await db
		.delete(movieListItem)
		.where(and(eq(movieListItem.id, movieId), eq(movieListItem.userId, userId)));
}

export async function toggleFavourite(userId: string, movieId: number) {
	const [item] = await db
		.select({ favourite: movieListItem.favourite })
		.from(movieListItem)
		.where(and(eq(movieListItem.id, movieId), eq(movieListItem.userId, userId)));

	if (!item) return;

	await db
		.update(movieListItem)
		.set({ favourite: !item.favourite })
		.where(and(eq(movieListItem.id, movieId), eq(movieListItem.userId, userId)));
}

export type DiaryEntryUpdate = {
	rating: number | null;
	comment: string | null;
	watchedAt: Date | null;
};

export async function updateDiaryEntry(
	userId: string,
	movieId: number,
	data: DiaryEntryUpdate
) {
	await db
		.update(movieListItem)
		.set({
			rating: data.rating,
			comment: data.comment,
			watchedAt: data.watchedAt
		})
		.where(
			and(
				eq(movieListItem.id, movieId),
				eq(movieListItem.userId, userId),
				eq(movieListItem.listType, 'watched')
			)
		);
}
