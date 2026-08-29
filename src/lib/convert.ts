import {
	BASE_TO_SMALL,
	composeDiacritic,
	DAKUTEN_TO_BASE,
	HANDAKUTEN_TO_BASE,
	isBaseChar,
	SMALL_TO_BASE,
} from "./kana";
import { glyphToken, type HunterToken } from "./tokens";

// ja: 表記ゆれを吸収する。合成用の濁点（U+3099）は NFC で濁音 1 文字にまとまる。
export function normalizeKana(input: string): string {
	return input
		.normalize("NFC")
		.replace(/\r\n?/g, "\n")
		.replace(/[　\t]/g, " ");
}

// ja: ひらがな列をハンター文字のトークン列へ分解する。未対応文字も落とさず持ち回る。
export function toTokens(input: string): HunterToken[] {
	const tokens: HunterToken[] = [];
	for (const char of normalizeKana(input)) {
		tokens.push(toToken(char));
	}
	return tokens;
}

function toToken(char: string): HunterToken {
	if (char === "\n") {
		return { kind: "newline" };
	}
	if (char === " ") {
		return { kind: "space" };
	}

	const small = SMALL_TO_BASE[char];
	if (small !== undefined) {
		return glyphToken(small, { small: true });
	}

	const dakuten = DAKUTEN_TO_BASE[char];
	if (dakuten !== undefined) {
		return glyphToken(dakuten, { diacritic: "dakuten" });
	}

	const handakuten = HANDAKUTEN_TO_BASE[char];
	if (handakuten !== undefined) {
		return glyphToken(handakuten, { diacritic: "handakuten" });
	}

	if (isBaseChar(char)) {
		return glyphToken(char);
	}

	return { kind: "unsupported", char };
}

// ja: トークン 1 個をひらがな（または元の未対応文字）へ戻す。
export function tokenToKana(token: HunterToken): string {
	switch (token.kind) {
		case "glyph": {
			if (token.small) {
				return BASE_TO_SMALL[token.base] ?? token.base;
			}
			if (token.diacritic !== null) {
				return composeDiacritic(token.base, token.diacritic) ?? token.base;
			}
			return token.base;
		}
		case "space":
			return " ";
		case "newline":
			return "\n";
		case "unsupported":
			return token.char;
	}
}

export function tokensToKana(tokens: readonly HunterToken[]): string {
	return tokens.map(tokenToKana).join("");
}

// ja: 未対応文字を重複なく、出現順に返す。警告表示に使う。
export function unsupportedChars(tokens: readonly HunterToken[]): string[] {
	const chars = tokens.flatMap((token) =>
		token.kind === "unsupported" ? [token.char] : [],
	);
	return [...new Set(chars)];
}
