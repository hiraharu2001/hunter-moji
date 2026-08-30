import { BASE_TO_SMALL, composeDiacritic, type Diacritic } from "./kana";
import { type GlyphToken, glyphToken, type HunterToken } from "./tokens";

// ja: パレット入力の編集操作。濁点・半濁点・小書きはいずれも直前の 1 字に付け外しする。
export function appendChar(
	tokens: readonly HunterToken[],
	base: string,
): HunterToken[] {
	return [...tokens, glyphToken(base)];
}

export function removeLast(tokens: readonly HunterToken[]): HunterToken[] {
	return tokens.slice(0, -1);
}

export function canApplyDiacritic(
	tokens: readonly HunterToken[],
	diacritic: Diacritic,
): boolean {
	const last = lastGlyph(tokens);
	if (last === undefined || last.small) {
		return false;
	}
	return (
		last.diacritic === diacritic ||
		composeDiacritic(last.base, diacritic) !== undefined
	);
}

export function applyDiacritic(
	tokens: readonly HunterToken[],
	diacritic: Diacritic,
): HunterToken[] {
	if (!canApplyDiacritic(tokens, diacritic)) {
		return [...tokens];
	}
	return replaceLastGlyph(tokens, (last) => ({
		...last,
		diacritic: last.diacritic === diacritic ? null : diacritic,
	}));
}

export function canToggleSmall(tokens: readonly HunterToken[]): boolean {
	const last = lastGlyph(tokens);
	if (last === undefined) {
		return false;
	}
	return (
		last.small ||
		(last.diacritic === null && BASE_TO_SMALL[last.base] !== undefined)
	);
}

export function toggleSmall(tokens: readonly HunterToken[]): HunterToken[] {
	if (!canToggleSmall(tokens)) {
		return [...tokens];
	}
	return replaceLastGlyph(tokens, (last) => ({ ...last, small: !last.small }));
}

function lastGlyph(tokens: readonly HunterToken[]): GlyphToken | undefined {
	const last = tokens.at(-1);
	return last?.kind === "glyph" ? last : undefined;
}

function replaceLastGlyph(
	tokens: readonly HunterToken[],
	update: (last: GlyphToken) => GlyphToken,
): HunterToken[] {
	const last = lastGlyph(tokens);
	if (last === undefined) {
		return [...tokens];
	}
	return [...tokens.slice(0, -1), update(last)];
}
