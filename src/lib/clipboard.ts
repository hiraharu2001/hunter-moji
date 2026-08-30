// ja: ブラウザ API の薄い包み。純粋関数ではないのでテストは持たず、呼び出し側は
// 必ず「対応しているか」を確かめてから使う。

export function canCopyImage(): boolean {
	return (
		typeof ClipboardItem === "function" &&
		typeof navigator.clipboard?.write === "function"
	);
}

// ja: PNG をクリップボードへ入れる。Safari はユーザー操作と同じタスクで write を
// 呼ばないと弾くため、blob は await せず Promise のまま ClipboardItem に渡す。
export function copyImage(png: Promise<Blob>): Promise<void> {
	return navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

export function canCopyText(): boolean {
	return typeof navigator.clipboard?.writeText === "function";
}

export function copyText(text: string): Promise<void> {
	return navigator.clipboard.writeText(text);
}

// ja: 端末の共有シートを使えるか。デスクトップのブラウザにはほぼ無いので、
// 使えるときだけボタンを出す。
export function canShareFiles(): boolean {
	return (
		typeof navigator.share === "function" &&
		typeof navigator.canShare === "function"
	);
}

// ja: PNG を共有シートへ渡す。共有できない形式なら false を返し、呼び出し側で
// 保存へ切り替える。
export async function shareImage(
	png: Promise<Blob>,
	fileName: string,
): Promise<boolean> {
	const file = new File([await png], fileName, { type: "image/png" });
	if (!navigator.canShare({ files: [file] })) {
		return false;
	}
	await navigator.share({ files: [file] });
	return true;
}

// ja: 共有シートを閉じただけのときは失敗として扱わない。
export function isAbort(cause: unknown): boolean {
	return cause instanceof Error && cause.name === "AbortError";
}
