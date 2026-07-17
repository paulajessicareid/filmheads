export const GENRES = [
	'Action',
	'Adventure',
	'Animation',
	'Comedy',
	'Crime',
	'Documentary',
	'Drama',
	'Family',
	'Fantasy',
	'History',
	'Horror',
	'Music',
	'Mystery',
	'Romance',
	'Science Fiction',
	'Thriller',
	'War',
	'Western'
] as const;

export type Genre = (typeof GENRES)[number];

const genreSet = new Set<string>(GENRES);

export function isValidGenre(name: string): name is Genre {
	return genreSet.has(name);
}
