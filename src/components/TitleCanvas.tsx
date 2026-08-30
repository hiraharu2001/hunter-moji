import { type RefObject, useMemo } from "react";
import { layoutTitle } from "../lib/title";
import type { HunterToken } from "../lib/tokens";
import { GlyphShape } from "./GlyphShape";
import { UnsupportedCell } from "./HunterCanvas";

const CELL_SIZE = 48;
const GAP = 10;
const TITLE_FONT_SIZE = 40;
const TITLE_GAP = 20;
// ja: グリフ行の折り返しは明示的な改行だけで起こす。横幅が枠に収まらないときの
// 縮小は .canvas__svg の CSS（max-width: 100%）に任せ、実測幅では折り返さない。
const LAYOUT_MAX_WIDTH = 100000;

type Props = {
	title: string;
	tokens: readonly HunterToken[];
	emptyMessage: string;
	svgRef?: RefObject<SVGSVGElement | null>;
};

// ja: アニメ版サブタイトルのように、上段にタイトル・下段にハンター文字を中央揃えで
// 積んだ 1 枚の SVG を描く。書き出しはこの SVG をそのまま使う。
export function TitleCanvas({ title, tokens, emptyMessage, svgRef }: Props) {
	const layout = useMemo(
		() =>
			layoutTitle(title, tokens, {
				cellSize: CELL_SIZE,
				gap: GAP,
				maxWidth: LAYOUT_MAX_WIDTH,
				titleFontSize: TITLE_FONT_SIZE,
				titleGap: TITLE_GAP,
			}),
		[title, tokens],
	);
	const isEmpty = title === "" && layout.cells.length === 0;

	return (
		<div className="canvas">
			{isEmpty ? (
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
					<title>{title === "" ? "タイトル風の変換結果" : title}</title>
					{title !== "" && (
						<text
							x={layout.titleX}
							y={layout.titleY}
							textAnchor="middle"
							dominantBaseline="central"
							fontFamily="sans-serif"
							fontWeight="700"
							fontSize={TITLE_FONT_SIZE}
							fill="currentColor"
						>
							{title}
						</text>
					)}
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
