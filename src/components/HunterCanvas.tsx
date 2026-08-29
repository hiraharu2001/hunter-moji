import { type RefObject, useMemo } from "react";
import { useElementWidth } from "../hooks/useElementWidth";
import { layoutTokens } from "../lib/layout";
import type { HunterToken } from "../lib/tokens";
import { GlyphShape } from "./GlyphShape";

const CELL_SIZE = 56;
const GAP = 10;
// ja: 幅を実測できていない初回描画で使う仮の幅。
const FALLBACK_WIDTH = 640;

type Props = {
	tokens: readonly HunterToken[];
	title: string;
	emptyMessage: string;
	svgRef?: RefObject<SVGSVGElement | null>;
};

// ja: トークン列を 1 枚の SVG に横書き・折り返しで描く。書き出しはこの SVG をそのまま使う。
export function HunterCanvas({ tokens, title, emptyMessage, svgRef }: Props) {
	const [containerRef, width] = useElementWidth<HTMLDivElement>();
	const layout = useMemo(
		() =>
			layoutTokens(tokens, {
				cellSize: CELL_SIZE,
				gap: GAP,
				maxWidth: width === 0 ? FALLBACK_WIDTH : width,
			}),
		[tokens, width],
	);

	return (
		<div className="canvas" ref={containerRef}>
			{layout.cells.length === 0 ? (
				<p className="canvas__empty">{emptyMessage}</p>
			) : (
				<svg
					ref={svgRef}
					className="canvas__svg"
					viewBox={`0 0 ${layout.width} ${layout.height}`}
					width={layout.width}
					height={layout.height}
					role="img"
				>
					<title>{title}</title>
					{layout.cells.map((cell) => (
						<g
							key={cell.index}
							transform={`translate(${cell.x} ${cell.y}) scale(${CELL_SIZE / 100})`}
						>
							{cell.token.kind === "glyph" ? (
								<GlyphShape token={cell.token} />
							) : (
								<UnsupportedCell
									char={
										cell.token.kind === "unsupported" ? cell.token.char : ""
									}
								/>
							)}
						</g>
					))}
				</svg>
			)}
		</div>
	);
}

// ja: 未対応文字は元の文字のまま、警告色で置く。
function UnsupportedCell({ char }: { char: string }) {
	return (
		<text
			x="50"
			y="50"
			textAnchor="middle"
			dominantBaseline="central"
			fontFamily="system-ui, sans-serif"
			fontSize="64"
			fill="#b3261e"
		>
			{char}
		</text>
	);
}
