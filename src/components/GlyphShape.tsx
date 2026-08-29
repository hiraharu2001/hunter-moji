import {
	dakutenGlyph,
	findGlyph,
	type Glyph,
	handakutenGlyph,
} from "../glyphs";
import type { Diacritic } from "../lib/kana";
import type { GlyphToken } from "../lib/tokens";

// ja: 書き出した SVG 単体でも同じ見た目になるよう、描画属性は CSS ではなく要素に持たせる。
const strokeProps = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 6,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

// ja: 小書きは同じ字形を 0.6 倍にして左下寄りに置く。
const SMALL_TRANSFORM = "translate(20 32) scale(0.6)";

type Props = {
	token: GlyphToken;
};

// ja: viewBox "0 0 100 100" の座標系で 1 文字分の図形を描く。
export function GlyphShape({ token }: Props) {
	const glyph = findGlyph(token.base);
	if (glyph === undefined) {
		return null;
	}
	const mark = markGlyph(token.diacritic);

	return (
		<>
			<g transform={token.small ? SMALL_TRANSFORM : undefined}>
				{glyph.paths.map((path) => (
					<path key={path} d={path} {...strokeProps} />
				))}
			</g>
			{mark?.paths.map((path) => (
				<path key={path} d={path} {...strokeProps} />
			))}
		</>
	);
}

function markGlyph(diacritic: Diacritic | null): Glyph | null {
	if (diacritic === "dakuten") {
		return dakutenGlyph;
	}
	if (diacritic === "handakuten") {
		return handakutenGlyph;
	}
	return null;
}
