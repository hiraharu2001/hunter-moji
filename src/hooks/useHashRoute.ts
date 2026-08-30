import { useCallback, useSyncExternalStore } from "react";
import { parseHash } from "../lib/share";

// ja: GitHub Pages でリロードしても 404 にならないよう、画面の切り替えは hash だけで行う。
export const TABS = [
	{ id: "title", label: "タイトル風" },
	{ id: "to-hunter", label: "かな → ハンター文字" },
	{ id: "to-kana", label: "ハンター文字 → かな" },
	{ id: "chart", label: "五十音対応表" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

const DEFAULT_TAB: TabId = "title";

function subscribe(onChange: () => void): () => void {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
}

// ja: 共有リンク（"#/to-hunter?t=..."）でも画面を取り違えないよう、本文は parseHash に任せる。
function readTab(): TabId {
	const { path } = parseHash(window.location.hash);
	return TABS.find((tab) => tab.id === path)?.id ?? DEFAULT_TAB;
}

export function useHashRoute(): [TabId, (tab: TabId) => void] {
	const tab = useSyncExternalStore(subscribe, readTab, () => DEFAULT_TAB);
	const setTab = useCallback((next: TabId) => {
		window.location.hash = `#/${next}`;
	}, []);

	return [tab, setTab];
}
