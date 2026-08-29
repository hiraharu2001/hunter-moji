import type { Diacritic } from "./kana";

// ja: ハンター文字 1 マス分の情報。glyph は「基字 + 濁点/半濁点 + 小書き」に分解して持つ。
export type GlyphToken = {
	kind: "glyph";
	base: string;
	diacritic: Diacritic | null;
	small: boolean;
};

export type HunterToken =
	| GlyphToken
	| { kind: "space" }
	| { kind: "newline" }
	| { kind: "unsupported"; char: string };

export function glyphToken(
	base: string,
	options: { diacritic?: Diacritic | null; small?: boolean } = {},
): GlyphToken {
	return {
		kind: "glyph",
		base,
		diacritic: options.diacritic ?? null,
		small: options.small ?? false,
	};
}
