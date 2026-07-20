<script lang="ts">
	import { enhance } from '$app/forms';

	type Movie = {
		id: number;
		title: string;
		posterPath: string | null;
		tmdbId?: number | null;
		releaseYear: number | null;
		overview: string | null;
		cast: string | null;
		rating: number | null;
		comment: string | null;
		watchedAt: Date | string | null;
	};

	let {
		movie,
		onClose
	}: {
		movie: Movie;
		onClose: () => void;
	} = $props();

	function toDateInputValue(value: Date | string | null): string {
		if (!value) return '';
		const date = typeof value === 'string' ? new Date(value) : value;
		if (Number.isNaN(date.getTime())) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Initial values — remounted via {#key movie.id} when opening a different entry
	/* svelte-ignore state_referenced_locally */
	let rating = $state(movie.rating ?? 0);
	/* svelte-ignore state_referenced_locally */
	let comment = $state(movie.comment ?? '');
	/* svelte-ignore state_referenced_locally */
	let watchedAt = $state(toDateInputValue(movie.watchedAt));
	/* svelte-ignore state_referenced_locally */
	let releaseYear = $state(movie.releaseYear);
	/* svelte-ignore state_referenced_locally */
	let overview = $state(movie.overview);
	/* svelte-ignore state_referenced_locally */
	let cast = $state(movie.cast);
	let detailsLoading = $state(false);
	let saving = $state(false);

	$effect(() => {
		const needsDetails =
			movie.tmdbId &&
			(releaseYear == null || !overview || !cast);

		if (!needsDetails) return;

		let cancelled = false;
		detailsLoading = true;

		const params = new URLSearchParams({
			tmdbId: String(movie.tmdbId),
			movieId: String(movie.id)
		});

		fetch(`/api/movies/details?${params}`)
			.then(async (response) => {
				if (!response.ok || cancelled) return;
				const data = (await response.json()) as {
					overview: string | null;
					releaseYear: number | null;
					cast: string | null;
				};
				if (cancelled) return;
				if (data.releaseYear != null) releaseYear = data.releaseYear;
				if (data.overview) overview = data.overview;
				if (data.cast) cast = data.cast;
			})
			.catch(() => {
				/* keep stored values */
			})
			.finally(() => {
				if (!cancelled) detailsLoading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}

	function setRating(value: number) {
		rating = rating === value ? 0 : value;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="diary-overlay-backdrop"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) onClose();
	}}
>
	<div
		class="diary-overlay-card"
		role="dialog"
		aria-modal="true"
		aria-labelledby="diary-overlay-title"
	>
		<button type="button" class="diary-overlay-close" aria-label="Close" onclick={onClose}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</button>

		<div class="diary-overlay-header">
			{#if movie.posterPath}
				<img src={movie.posterPath} alt="" class="diary-overlay-poster" width="140" height="210" />
			{:else}
				<span class="poster-placeholder diary-overlay-poster" aria-hidden="true"></span>
			{/if}
			<div class="diary-overlay-heading">
				<h2 id="diary-overlay-title" class="diary-overlay-title">{movie.title}</h2>
				{#if releaseYear}
					<p class="diary-overlay-year">{releaseYear}</p>
				{/if}
			</div>
		</div>

		<div class="diary-overlay-details">
			{#if detailsLoading && !overview}
				<p class="diary-overlay-meta">Loading details…</p>
			{:else}
				{#if overview}
					<section class="diary-overlay-block">
						<h3>Synopsis</h3>
						<p>{overview}</p>
					</section>
				{/if}
				{#if cast}
					<section class="diary-overlay-block">
						<h3>Stars</h3>
						<p>{cast}</p>
					</section>
				{/if}
			{/if}
		</div>

		<form
			method="post"
			action="?/updateDiaryEntry"
			use:enhance={() => {
				saving = true;
				return async ({ result, update }) => {
					saving = false;
					if (result.type === 'success') {
						await update();
						onClose();
						return;
					}
					await update();
				};
			}}
			class="diary-overlay-form"
		>
			<input type="hidden" name="movieId" value={movie.id} />
			<input type="hidden" name="rating" value={rating > 0 ? rating : ''} />

			<fieldset class="diary-overlay-rating">
				<legend>Your rating</legend>
				<div class="diary-rating diary-rating-interactive" role="group" aria-label="Rate out of 5 stars">
					{#each [1, 2, 3, 4, 5] as star (star)}
						<button
							type="button"
							class="diary-rating-star"
							class:filled={star <= rating}
							aria-label="{star} star{star === 1 ? '' : 's'}"
							aria-pressed={star <= rating}
							onclick={() => setRating(star)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill={star <= rating ? 'currentColor' : 'none'}
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polygon
									points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
								/>
							</svg>
						</button>
					{/each}
				</div>
			</fieldset>

			<label class="diary-overlay-field">
				Comment
				<textarea name="comment" rows="4" bind:value={comment} placeholder="How was it?"></textarea>
			</label>

			<label class="diary-overlay-field">
				Date watched
				<input type="date" name="watchedAt" bind:value={watchedAt} />
			</label>

			<div class="diary-overlay-actions">
				<button type="button" class="btn-secondary" onclick={onClose}>Cancel</button>
				<button type="submit" class="btn-primary" disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</form>
	</div>
</div>
