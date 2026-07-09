<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type ActiveList = 'watchlist' | 'watched';
	let activeList = $state<ActiveList>('watchlist');

	const movies = $derived(activeList === 'watchlist' ? data.wantToWatch : data.watched);
	const listType = $derived(activeList === 'watchlist' ? 'want_to_watch' : 'watched');
	const listTitle = $derived(activeList === 'watchlist' ? 'Watchlist' : 'Your film diary');
	const switchLabel = $derived(activeList === 'watchlist' ? 'Your film diary' : 'Watchlist');
</script>

<div class="container">
	<div class="list-switcher">
		<button type="button" class="btn-switch" onclick={() => (activeList = activeList === 'watchlist' ? 'watched' : 'watchlist')}>
			{switchLabel}
		</button>
	</div>

	<section class="list-section">
		<h2>{listTitle}</h2>
		<form method="post" action="?/addMovie" use:enhance class="add-form">
			<input type="hidden" name="listType" value={listType} />
			<input type="text" name="title" placeholder="Movie title" required />
			<button type="submit" class="btn-primary">Add</button>
		</form>
		{#if movies.length === 0}
			<p class="empty">No movies yet</p>
		{:else}
			<ul class="movie-list">
				{#each movies as movie (movie.id)}
					<li>{movie.title}</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if form?.message}
		<p class="error">{form.message}</p>
	{/if}
</div>
