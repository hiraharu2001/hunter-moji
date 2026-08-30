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

// ja: 共有シートに何を渡せたか。ファイルを共有できない端末では共有リンクへ、
// それも作れなければ呼び出し側で保存へ落とす。
export type ShareResult = "file" | "url" | "unsupported";

// ja: PNG を共有シートへ渡す。ファイルを共有できるかは端末で決まるうえ、
// navigator.canShare を持たないブラウザもあるため、ここで確かめてから呼ぶ。
export async function shareImage(
	png: Promise<Blob>,
	fileName: string,
	fallbackUrl: string | null,
): Promise<ShareResult> {
	const file = new File([await png], fileName, { type: "image/png" });
	if (navigator.canShare?.({ files: [file] }) === true) {
		await navigator.share({ files: [file] });
		return "file";
	}
	if (fallbackUrl === null) {
		return "unsupported";
	}
	await navigator.share({ url: fallbackUrl });
	return "url";
}

// ja: 共有シートを閉じただけのときは失敗として扱わない。
export function isAbort(cause: unknown): boolean {
	return cause instanceof Error && cause.name === "AbortError";
}
