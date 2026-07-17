<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="card">
	<h2>Filmheads</h2>

	<div class="form-section">
		<h3>Log in</h3>
		<form method="post" action="?/signInEmail" use:enhance>
			<label>
				Email
				<input type="email" name="email" required />
			</label>
			<label>
				Password
				<input type="password" name="password" required />
			</label>
			<button type="submit" class="btn-primary">Log in</button>
		</form>
	</div>

	<hr class="divider" />

	<div class="form-section">
		<h3>Create account</h3>
		<form method="post" action="?/signUpEmail" use:enhance>
			<label>
				Name
				<input type="text" name="name" required />
			</label>
			<label>
				Email
				<input type="email" name="email" required />
			</label>
			<label>
				Password
				<input type="password" name="password" required />
			</label>
			<button type="submit" class="btn-primary">Create account</button>
		</form>
	</div>

	{#if form?.message}
		<p class="error">{form.message}</p>
	{/if}
</div>
