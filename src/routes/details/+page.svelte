<script lang="ts">
	import { enhance } from '$app/forms';
	import { getCountryName } from '$lib/data/countries';
	import { getLanguageName } from '$lib/data/languages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const availableCountries = $derived(
		data.countries.filter((country) => !data.preferences.countries.includes(country.code))
	);
	const availableLanguages = $derived(
		data.languages.filter((language) => !data.preferences.languages.includes(language.code))
	);
</script>

<div class="container">
	<section class="content-section">
		<h2>Your details</h2>
		<p><strong>Name:</strong> {data.user.name}</p>
		<p><strong>Email:</strong> {data.user.email}</p>
	</section>

	<section class="content-section">
		<h2>Countries</h2>
		{#if data.preferences.countries.length === 0}
			<p class="empty">No countries added yet.</p>
		{:else}
			<ul class="preference-list">
				{#each data.preferences.countries as countryCode (countryCode)}
					<li>
						<span>{getCountryName(countryCode)}</span>
						<form method="post" action="?/removeCountry" use:enhance>
							<input type="hidden" name="countryCode" value={countryCode} />
							<button type="submit" class="btn-remove">Remove</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		<form method="post" action="?/addCountry" class="add-preference-form" use:enhance>
			<label>
				Add country
				<select name="countryCode" required disabled={availableCountries.length === 0}>
					<option value="">
						{availableCountries.length === 0 ? 'All countries added' : 'Select a country'}
					</option>
					{#each availableCountries as country (country.code)}
						<option value={country.code}>{country.name}</option>
					{/each}
				</select>
			</label>
			<button type="submit" class="btn-primary" disabled={availableCountries.length === 0}>
				Add
			</button>
		</form>
	</section>

	<section class="content-section">
		<h2>Languages</h2>
		{#if data.preferences.languages.length === 0}
			<p class="empty">No languages added yet.</p>
		{:else}
			<ul class="preference-list">
				{#each data.preferences.languages as languageCode (languageCode)}
					<li>
						<span>{getLanguageName(languageCode)}</span>
						<form method="post" action="?/removeLanguage" use:enhance>
							<input type="hidden" name="languageCode" value={languageCode} />
							<button type="submit" class="btn-remove">Remove</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		<form method="post" action="?/addLanguage" class="add-preference-form" use:enhance>
			<label>
				Add language
				<select name="languageCode" required disabled={availableLanguages.length === 0}>
					<option value="">
						{availableLanguages.length === 0 ? 'All languages added' : 'Select a language'}
					</option>
					{#each availableLanguages as language (language.code)}
						<option value={language.code}>{language.name}</option>
					{/each}
				</select>
			</label>
			<button type="submit" class="btn-primary" disabled={availableLanguages.length === 0}>
				Add
			</button>
		</form>
	</section>
</div>
