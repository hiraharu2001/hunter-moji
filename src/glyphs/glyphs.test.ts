import { describe, expect, it } from "vitest";
import { BASE_CHARS } from "../lib/kana";
import { dakutenGlyph, findGlyph, glyphs, handakutenGlyph } from ".";

const allGlyphs = [...glyphs, dakutenGlyph, handakutenGlyph];

describe("グリフデータ", () => {
	it("対応するすべての文字に字形がある", () => {
		const missing = BASE_CHARS.filter((char) => findGlyph(char) === undefined);

		expect(missing).toEqual([]);
	});

	it("対応表に無い字形を持たない", () => {
		const extra = glyphs
			.map((glyph) => glyph.char)
			.filter((char) => !BASE_CHARS.includes(char));

		expect(extra).toEqual([]);
	});

	it("字形はすべて互いに異なる", () => {
		const shapes = allGlyphs.map((glyph) => glyph.paths.join(" "));

		expect(new Set(shapes).size).toBe(allGlyphs.length);
	});

	it("字形を持たないマスがない", () => {
		const empty = allGlyphs.filter((glyph) => glyph.paths.length === 0);

		expect(empty).toEqual([]);
	});

	it("座標が viewBox 0 0 100 100 の内側に収まる", () => {
		const outside = allGlyphs.filter((glyph) =>
			glyph.paths.some((path) =>
				(path.match(/-?\d+(?:\.\d+)?/g) ?? []).some((value) => {
					const size = Number(value);
					return size < 0 || size > 100;
				}),
			),
		);

		expect(outside.map((glyph) => glyph.char)).toEqual([]);
	});
});
