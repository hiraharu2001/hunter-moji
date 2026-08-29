import { describe, expect, it } from "vitest";
import { BASE_CHARS } from "../lib/kana";
import {
	dakutenGlyph,
	findGlyph,
	type Glyph,
	glyphs,
	handakutenGlyph,
} from ".";

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
		const shapes = allGlyphs.map(shapeKey);

		expect(new Set(shapes).size).toBe(allGlyphs.length);
	});

	it("字形を持たないマスがない", () => {
		const empty = allGlyphs.filter(
			(glyph) => glyph.paths.length === 0 && (glyph.dots ?? []).length === 0,
		);

		expect(empty).toEqual([]);
	});

	it("座標が viewBox 0 0 100 100 の内側に収まる", () => {
		const outside = allGlyphs.filter((glyph) =>
			extent(glyph).some((value) => value < 0 || value > 100),
		);

		expect(outside.map((glyph) => glyph.char)).toEqual([]);
	});
});

function shapeKey(glyph: Glyph): string {
	const dots = (glyph.dots ?? []).map((dot) => `${dot.cx},${dot.cy},${dot.r}`);
	return [...glyph.paths, ...dots].join(" ");
}

// ja: パスの数値と、円の外接矩形（中心 ± 半径）を viewBox に収まるか確かめる座標として集める。
function extent(glyph: Glyph): number[] {
	const fromPaths = glyph.paths.flatMap((path) =>
		(path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number),
	);
	const fromDots = (glyph.dots ?? []).flatMap((dot) => [
		dot.cx - dot.r,
		dot.cx + dot.r,
		dot.cy - dot.r,
		dot.cy + dot.r,
	]);
	return [...fromPaths, ...fromDots];
}
