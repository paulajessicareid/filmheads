<script lang="ts">
	import MovieListPage from '$lib/components/MovieListPage.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<MovieListPage
	title="Your film diary"
	movies={data.watched}
	listType="watched"
	message={form?.message}
	emptyMessage="No watched movies yet"
/>
