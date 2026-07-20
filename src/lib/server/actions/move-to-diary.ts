import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { moveToDiary } from '$lib/server/db/movies';

export async function moveToDiaryAction(event: RequestEvent) {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const formData = await event.request.formData();
	const movieIdRaw = formData.get('movieId')?.toString().trim() ?? '';
	const movieId = Number.parseInt(movieIdRaw, 10);

	if (!Number.isInteger(movieId) || movieId <= 0) {
		return fail(400, { message: 'Invalid movie' });
	}

	await moveToDiary(event.locals.user.id, movieId);
	return { success: true };
}
