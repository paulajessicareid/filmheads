<script lang="ts">
	let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<div class="page-header">
	<h2>{title}</h2>
	<p class="page-subheader">{subtitle}</p>
</div>
