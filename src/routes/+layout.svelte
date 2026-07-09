<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<header>
		<h1>Filmheads</h1>
		<div class="user-info">
			<span>{data.user.name}</span>
			<form method="post" action="/?/signOut">
				<button type="submit">Sign out</button>
			</form>
		</div>
	</header>
{/if}

{@render children()}
