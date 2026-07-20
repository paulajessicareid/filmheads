import { browser } from '$app/environment';
import type { ListType } from '$lib/server/db/movies';
import type { ViewMode } from '$lib/types/movie';

function storageKey(listType: ListType) {
	return `filmheads-view-${listType}`;
}

export function loadViewMode(listType: ListType): ViewMode {
	if (!browser) return 'list';
	const stored = localStorage.getItem(storageKey(listType));
	return stored === 'list' || stored === 'card' ? stored : 'list';
}

export function saveViewMode(listType: ListType, mode: ViewMode): void {
	if (!browser) return;
	localStorage.setItem(storageKey(listType), mode);
}
