<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<header>
		<h1 class="bungee-shade-regular">Filmheads</h1>
		<UserMenu userName={data.user.name} />
	</header>
	<AppNav />
{/if}

{@render children()}
