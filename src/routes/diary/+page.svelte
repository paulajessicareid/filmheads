<script lang="ts">
	import MovieListPage from '$lib/components/MovieListPage.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<MovieListPage
	title="Film diary"
	subtitle="A diary of all the films you've been watching."
	movies={data.watched}
	listType="watched"
	message={form?.message}
	emptyMessage="No watched movies yet"
	guidanceMessage={data.guidanceMessage}
/>
