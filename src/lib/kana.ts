export type Diacritic = "dakuten" | "handakuten";

// ja: 濁点付きのかな → 基字。逆引きはこの表を反転して作り、往復変換のずれを防ぐ。
export const DAKUTEN_TO_BASE: Readonly<Record<string, string>> = {
	が: "か",
	ぎ: "き",
	ぐ: "く",
	げ: "け",
	ご: "こ",
	ざ: "さ",
	じ: "し",
	ず: "す",
	ぜ: "せ",
	ぞ: "そ",
	だ: "た",
	ぢ: "ち",
	づ: "つ",
	で: "て",
	ど: "と",
	ば: "は",
	び: "ひ",
	ぶ: "ふ",
	べ: "へ",
	ぼ: "ほ",
	ゔ: "う",
};

// ja: 半濁点付きのかな → 基字。
export const HANDAKUTEN_TO_BASE: Readonly<Record<string, string>> = {
	ぱ: "は",
	ぴ: "ひ",
	ぷ: "ふ",
	ぺ: "へ",
	ぽ: "ほ",
};

// ja: 小書きのかな → 基字。小書きは同じ字形を縮小して描く。
export const SMALL_TO_BASE: Readonly<Record<string, string>> = {
	ぁ: "あ",
	ぃ: "い",
	ぅ: "う",
	ぇ: "え",
	ぉ: "お",
	ゃ: "や",
	ゅ: "ゆ",
	ょ: "よ",
	っ: "つ",
	ゎ: "わ",
};

function invert(
	table: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
	return Object.fromEntries(
		Object.entries(table).map(([composed, base]) => [base, composed]),
	);
}

export const BASE_TO_DAKUTEN = invert(DAKUTEN_TO_BASE);
export const BASE_TO_HANDAKUTEN = invert(HANDAKUTEN_TO_BASE);
export const BASE_TO_SMALL = invert(SMALL_TO_BASE);

// ja: 五十音表の並び。null は対応するかなが無い枠（や行のい段など）。
export const GOJUON_ROWS: ReadonlyArray<{
	label: string;
	chars: ReadonlyArray<string | null>;
}> = [
	{ label: "あ行", chars: ["あ", "い", "う", "え", "お"] },
	{ label: "か行", chars: ["か", "き", "く", "け", "こ"] },
	{ label: "さ行", chars: ["さ", "し", "す", "せ", "そ"] },
	{ label: "た行", chars: ["た", "ち", "つ", "て", "と"] },
	{ label: "な行", chars: ["な", "に", "ぬ", "ね", "の"] },
	{ label: "は行", chars: ["は", "ひ", "ふ", "へ", "ほ"] },
	{ label: "ま行", chars: ["ま", "み", "む", "め", "も"] },
	{ label: "や行", chars: ["や", null, "ゆ", null, "よ"] },
	{ label: "ら行", chars: ["ら", "り", "る", "れ", "ろ"] },
	{ label: "わ行", chars: ["わ", null, null, null, "を"] },
	{ label: "ん", chars: ["ん", null, null, null, null] },
];

export const VOWEL_LABELS = ["あ段", "い段", "う段", "え段", "お段"] as const;

// ja: 清音 46 字。五十音表と同じ並びを正本にする。
export const BASE_KANA: readonly string[] = GOJUON_ROWS.flatMap((row) =>
	row.chars.filter((char): char is string => char !== null),
);

// ja: かな以外で字形を持つ記号。半角の「?」「!」は正規化で全角へそろえる。
export const PUNCTUATION: readonly string[] = ["ー", "、", "。", "？", "！"];

export const BASE_CHARS: readonly string[] = [...BASE_KANA, ...PUNCTUATION];

const baseCharSet = new Set(BASE_CHARS);

export function isBaseChar(char: string): boolean {
	return baseCharSet.has(char);
}

// ja: 基字に濁点・半濁点を付けた合成済みのかなを返す。対応が無ければ undefined。
export function composeDiacritic(
	base: string,
	diacritic: Diacritic,
): string | undefined {
	return diacritic === "dakuten"
		? BASE_TO_DAKUTEN[base]
		: BASE_TO_HANDAKUTEN[base];
}
