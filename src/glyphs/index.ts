import { glyphs } from "./glyphs";
import type { Glyph } from "./types";

export { dakutenGlyph, glyphs, handakutenGlyph } from "./glyphs";
export type { Glyph } from "./types";

const glyphByChar = new Map(glyphs.map((glyph) => [glyph.char, glyph]));

export function findGlyph(char: string): Glyph | undefined {
	return glyphByChar.get(char);
}
