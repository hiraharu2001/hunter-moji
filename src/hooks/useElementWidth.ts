import { type RefObject, useEffect, useRef, useState } from "react";

// ja: 折り返し幅を決めるために、要素の実測幅を返す。初回描画時は 0 になる。
export function useElementWidth<T extends HTMLElement>(): [
	RefObject<T | null>,
	number,
] {
	const ref = useRef<T>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const element = ref.current;
		if (element === null) {
			return;
		}
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setWidth(entry.contentRect.width);
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return [ref, width];
}
