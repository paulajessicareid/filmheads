<script lang="ts">
	import { browser } from '$app/environment';

	const STORAGE_KEY = 'filmheads-guidance-dismissed';

	let {
		message,
		onDismiss
	}: {
		message: string;
		onDismiss?: () => void;
	} = $props();

	let visible = $state(true);

	$effect(() => {
		if (!browser) return;
		const dismissed = localStorage.getItem(STORAGE_KEY);
		if (dismissed === message) {
			visible = false;
			onDismiss?.();
		} else {
			visible = true;
		}
	});

	function dismiss() {
		visible = false;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, message);
		}
		onDismiss?.();
	}
</script>

{#if visible}
	<div class="first-run-guidance" role="status">
		<p class="first-run-guidance-text">{message}</p>
		<button type="button" class="first-run-guidance-close" aria-label="Dismiss" onclick={dismiss}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</button>
	</div>
{/if}
