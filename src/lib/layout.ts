import type { HunterToken } from "./tokens";

export type LayoutOptions = {
	// ja: 1 マスの一辺（px）。グリフの viewBox 100 単位をこの大きさに写す。
	cellSize: number;
	gap: number;
	maxWidth: number;
};

export type PlacedToken = {
	token: HunterToken;
	index: number;
	column: number;
	row: number;
	x: number;
	y: number;
};

export type Layout = {
	cells: PlacedToken[];
	columns: number;
	width: number;
	height: number;
};

// ja: トークン列を横書き・折り返しで配置する。空白は 1 マス空け、改行で次の行へ送る。
export function layoutTokens(
	tokens: readonly HunterToken[],
	options: LayoutOptions,
): Layout {
	const { cellSize, gap, maxWidth } = options;
	const step = cellSize + gap;
	const columns = Math.max(1, Math.floor((maxWidth + gap) / step));

	const cells: PlacedToken[] = [];
	let column = 0;
	let row = 0;
	let usedColumns = 0;
	let usedRows = 0;

	tokens.forEach((token, index) => {
		if (token.kind === "newline") {
			row += 1;
			column = 0;
			return;
		}
		if (column >= columns) {
			row += 1;
			column = 0;
		}
		if (token.kind !== "space") {
			cells.push({
				token,
				index,
				column,
				row,
				x: column * step,
				y: row * step,
			});
			usedColumns = Math.max(usedColumns, column + 1);
			usedRows = Math.max(usedRows, row + 1);
		}
		column += 1;
	});

	return {
		cells,
		columns,
		width: usedColumns === 0 ? 0 : usedColumns * step - gap,
		height: usedRows === 0 ? 0 : usedRows * step - gap,
	};
}
