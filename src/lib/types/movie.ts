export type Movie = {
	id: number;
	title: string;
	posterPath: string | null;
	tmdbId: number | null;
	genres: string | null;
	director: string | null;
	releaseYear: number | null;
	overview: string | null;
	cast: string | null;
	favourite: boolean;
	rating: number | null;
	comment: string | null;
	watchedAt: Date | string | null;
	createdAt: Date | string;
};

export type MovieSearchResult = {
	tmdbId: number;
	title: string;
	year: string | null;
	posterUrl: string | null;
};

export type ViewMode = 'list' | 'card';

export type SortBy = 'rating' | 'az' | 'newest' | 'oldest' | 'year';
