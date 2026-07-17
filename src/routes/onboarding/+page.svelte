<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedGenres = $state<string[]>([]);

	const atMax = $derived(selectedGenres.length >= 4);

	function toggleGenre(genre: string) {
		if (selectedGenres.includes(genre)) {
			selectedGenres = selectedGenres.filter((g) => g !== genre);
			return;
		}
		if (selectedGenres.length >= 4) return;
		selectedGenres = [...selectedGenres, genre];
	}
</script>

<PageHeader
	title="Set up your FH reccs"
	subtitle="You can pick up to 4 genres to help get your recommendations started."
/>

<div class="container">
	<section class="content-section onboarding-section">
		<form method="post" action="?/save" use:enhance>
			<div class="genre-pills" role="group" aria-label="Genre preferences">
				{#each data.genres as genre (genre)}
					{@const active = selectedGenres.includes(genre)}
					<button
						type="button"
						class="genre-pill"
						class:active
						disabled={!active && atMax}
						aria-pressed={active}
						onclick={() => toggleGenre(genre)}
					>
						{genre}
					</button>
				{/each}
			</div>

			{#each selectedGenres as genre (genre)}
				<input type="hidden" name="genres" value={genre} />
			{/each}

			<div class="onboarding-prefs">
				<label>
					Country <span class="optional-label">(optional)</span>
					<select name="country">
						<option value="">Select a country</option>
						{#each data.countries as country (country.code)}
							<option value={country.code}>{country.name}</option>
						{/each}
					</select>
				</label>
				<label>
					Language <span class="optional-label">(optional)</span>
					<select name="language">
						<option value="">Select a language</option>
						{#each data.commonLanguages as language (language.code)}
							<option value={language.code}>{language.name}</option>
						{/each}
					</select>
				</label>
			</div>

			<p class="form-note">
				Country and language are optional — you can save with genres alone and change these later
				in your profile.
			</p>

			<button type="submit" class="btn-primary">Save</button>
		</form>

		<a href="/" class="onboarding-skip">Skip</a>

		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</section>
</div>
