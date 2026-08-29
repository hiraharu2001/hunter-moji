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
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

const STROKE_WIDTH = 6;

// ja: 小書きは同じ字形を縮めて右下へ寄せる。線の太さは縮小の逆数で戻し、基字とそろえる。
const SMALL_SCALE = 0.62;
const SMALL_TRANSFORM = `translate(34 30) scale(${SMALL_SCALE})`;

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
	const strokeWidth = token.small ? STROKE_WIDTH / SMALL_SCALE : STROKE_WIDTH;

	return (
		<>
			<g transform={token.small ? SMALL_TRANSFORM : undefined}>
				<GlyphParts glyph={glyph} strokeWidth={strokeWidth} />
			</g>
			{mark !== null && <GlyphParts glyph={mark} strokeWidth={STROKE_WIDTH} />}
		</>
	);
}

function GlyphParts({
	glyph,
	strokeWidth,
}: {
	glyph: Glyph;
	strokeWidth: number;
}) {
	return (
		<>
			{glyph.paths.map((path) => (
				<path key={path} d={path} strokeWidth={strokeWidth} {...strokeProps} />
			))}
			{glyph.dots?.map((dot) => (
				<circle
					key={`${dot.cx}-${dot.cy}-${dot.r}`}
					cx={dot.cx}
					cy={dot.cy}
					r={dot.r}
					fill="currentColor"
				/>
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
