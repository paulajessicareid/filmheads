<script lang="ts">
	import { onMount } from 'svelte';

	let { userName }: { userName: string } = $props();

	let open = $state(false);
	let menuEl: HTMLDivElement | undefined = $state();

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuEl && !menuEl.contains(event.target as Node)) {
				close();
			}
		}

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="user-menu" bind:this={menuEl}>
	<button type="button" class="user-menu-trigger" onclick={toggle} aria-expanded={open}>
		{userName}
	</button>

	{#if open}
		<div class="user-menu-dropdown" role="menu">
			<a href="/details" class="user-menu-item" role="menuitem" onclick={close}>Details</a>
			<form method="post" action="/sign-out" class="user-menu-sign-out">
				<button type="submit" class="user-menu-item" role="menuitem">Sign out</button>
			</form>
		</div>
	{/if}
</div>
