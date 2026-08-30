import { useSyncExternalStore } from "react";
import { parseHash } from "../lib/share";

function subscribe(onChange: () => void): () => void {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
}

function readText(): string {
	return parseHash(window.location.hash).text;
}

// ja: 共有リンクに載っている本文。開いたあとに別の共有リンクへ移っても hash の
// 変化だけで済む（同一ページ内の移動で再読み込みが起きない）ため、購読して追う。
export function useSharedText(): string {
	return useSyncExternalStore(subscribe, readText, () => "");
}
