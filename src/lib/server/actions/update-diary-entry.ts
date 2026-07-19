import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { updateDiaryEntry } from '$lib/server/db/movies';

export async function updateDiaryEntryAction(event: RequestEvent) {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const formData = await event.request.formData();
	const movieIdRaw = formData.get('movieId')?.toString().trim() ?? '';
	const movieId = Number.parseInt(movieIdRaw, 10);

	if (!Number.isInteger(movieId) || movieId <= 0) {
		return fail(400, { message: 'Invalid movie' });
	}

	const ratingRaw = formData.get('rating')?.toString().trim() ?? '';
	let rating: number | null = null;

	if (ratingRaw !== '') {
		rating = Number.parseInt(ratingRaw, 10);
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { message: 'Rating must be between 1 and 5' });
		}
	}

	const commentRaw = formData.get('comment')?.toString() ?? '';
	const comment = commentRaw.trim() === '' ? null : commentRaw.trim();

	const watchedAtRaw = formData.get('watchedAt')?.toString().trim() ?? '';
	let watchedAt: Date | null = null;

	if (watchedAtRaw !== '') {
		const parsed = new Date(`${watchedAtRaw}T00:00:00`);
		if (Number.isNaN(parsed.getTime())) {
			return fail(400, { message: 'Invalid watch date' });
		}
		watchedAt = parsed;
	}

	await updateDiaryEntry(event.locals.user.id, movieId, { rating, comment, watchedAt });

	return { success: true };
}
