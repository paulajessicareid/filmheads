<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const links = [
		{ href: '/diary', label: 'Film diary' },
		{ href: '/recs', label: 'FH recs' },
		{ href: '/', label: 'Watchlist' },
		{ href: '/about', label: 'About' }
	] as const;

	function isActive(href: string) {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<nav class="app-nav" aria-label="Main">
	<ul>
		{#each links as link (link.href)}
			<li>
				<a href={resolve(link.href)} class:active={isActive(link.href)}>{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>
