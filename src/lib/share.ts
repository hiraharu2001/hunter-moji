// ja: 共有リンクに載せられる本文の長さ。これを超えると URL が長くなりすぎて、
// 貼り付け先で途中から切れることがあるため、リンクを作らせない。
export const SHARE_TEXT_LIMIT = 200;

const TEXT_PARAM = "t";

export type HashRoute = {
	// ja: 画面を表す hash のパス部分（"to-hunter" など）。
	path: string;
	// ja: 共有リンクに載っていた本文。無ければ空文字。
	text: string;
};

// ja: "#/to-hunter?t=%E3%81%82" のような hash を画面と本文に分ける。
export function parseHash(hash: string): HashRoute {
	const body = hash.replace(/^#\/?/, "");
	const separator = body.indexOf("?");
	if (separator === -1) {
		return { path: body, text: "" };
	}
	const params = new URLSearchParams(body.slice(separator + 1));
	return {
		path: body.slice(0, separator),
		text: params.get(TEXT_PARAM) ?? "",
	};
}

// ja: 今開いている URL に、本文を載せた hash を付け直して共有リンクにする。
export function buildShareUrl(
	pageUrl: string,
	path: string,
	text: string,
): string {
	const url = new URL(pageUrl);
	url.hash =
		text === ""
			? `/${path}`
			: `/${path}?${TEXT_PARAM}=${encodeURIComponent(text)}`;
	return url.toString();
}

// ja: 共有リンクを作れる本文か。空の入力や長すぎる入力ではボタンを押させない。
export function canBuildShareUrl(text: string): boolean {
	return text !== "" && text.length <= SHARE_TEXT_LIMIT;
}
