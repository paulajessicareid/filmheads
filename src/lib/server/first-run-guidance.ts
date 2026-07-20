import type { getMoviesByUser } from '$lib/server/db/movies';
import type { getUserPreferences } from '$lib/server/db/user-preferences';

const MSG_GENRES_NO_MOVIES =
	"Add a few films you've loved to your diary, so we can start cooking up your personalised FH recs.";

const MSG_NO_GENRES =
	"Don't forget to pick up to 4 genres in your details so your personalised FH recs can better fit your vibe.";

const MSG_NO_GENRES_NO_MOVIES =
	"Pick up to 4 genres in your details and add a few films you've loved to your diary so we can start cooking up your personalised FH recs.";

type Movies = Awaited<ReturnType<typeof getMoviesByUser>>;
type Prefs = Awaited<ReturnType<typeof getUserPreferences>>;

export function getFirstRunGuidanceMessage(movies: Movies, prefs: Prefs): string | null {
	const movieCount = movies.wantToWatch.length + movies.watched.length;
	const hasGenres = prefs.genres.length > 0;
	const hasMovies = movieCount > 0;

	if (!hasGenres && !hasMovies) return MSG_NO_GENRES_NO_MOVIES;
	if (!hasGenres) return MSG_NO_GENRES;
	if (!hasMovies) return MSG_GENRES_NO_MOVIES;
	return null;
}
