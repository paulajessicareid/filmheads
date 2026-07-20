<script lang="ts">
	import MovieListPage from '$lib/components/MovieListPage.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<MovieListPage
	title="Watchlist"
	subtitle="Keep track of all the films you want to watch."
	movies={data.wantToWatch}
	listType="want_to_watch"
	message={form?.message}
	guidanceMessage={data.guidanceMessage}
/>
