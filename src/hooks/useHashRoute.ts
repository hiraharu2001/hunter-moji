import { useCallback, useSyncExternalStore } from "react";

// ja: GitHub Pages でリロードしても 404 にならないよう、画面の切り替えは hash だけで行う。
export const TABS = [
	{ id: "to-hunter", label: "ひらがな → ハンター文字" },
	{ id: "to-kana", label: "ハンター文字 → ひらがな" },
	{ id: "chart", label: "五十音対応表" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

const DEFAULT_TAB: TabId = "to-hunter";

function subscribe(onChange: () => void): () => void {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
}

function readTab(): TabId {
	const id = window.location.hash.replace(/^#\/?/, "");
	return TABS.find((tab) => tab.id === id)?.id ?? DEFAULT_TAB;
}

export function useHashRoute(): [TabId, (tab: TabId) => void] {
	const tab = useSyncExternalStore(subscribe, readTab, () => DEFAULT_TAB);
	const setTab = useCallback((next: TabId) => {
		window.location.hash = `#/${next}`;
	}, []);

	return [tab, setTab];
}
