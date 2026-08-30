import { useCallback, useEffect, useRef, useState } from "react";

const CLEAR_DELAY = 2400;

// ja: 押した直後だけ伝えたい結果（コピーの成否など）を、一定時間だけ表示する。
export function useFlashMessage(): [string, (message: string) => void] {
	const [message, setMessage] = useState("");
	const timer = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (timer.current !== null) {
				window.clearTimeout(timer.current);
			}
		},
		[],
	);

	const flash = useCallback((next: string) => {
		if (timer.current !== null) {
			window.clearTimeout(timer.current);
		}
		setMessage(next);
		timer.current = window.setTimeout(() => setMessage(""), CLEAR_DELAY);
	}, []);

	return [message, flash];
}
