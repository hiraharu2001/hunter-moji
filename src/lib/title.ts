import { hiraganaToKatakana } from "./kana";
import { layoutTokens, type PlacedToken } from "./layout";
import type { HunterToken } from "./tokens";

// ja: カタカナ本体のブロック（ァ〜ヶ）。長音「ー」はこの範囲外にあるので別扱いする。
// ヷヸヹヺ（0x30F7〜0x30FA）は convert.ts の katakanaToHiragana が変換できず
// unsupported になるため、この範囲には含めない。
const KATAKANA_MIN = 0x30a1;
const KATAKANA_MAX = 0x30f6;
// ja: カタカナ以外でタイトルに許すのは長音「ー」と区切りの「×」だけ。
const EXTRA_ALLOWED_CHARS = new Set(["ー", "×"]);

function isAllowedTitleChar(char: string): boolean {
	if (EXTRA_ALLOWED_CHARS.has(char)) {
		return true;
	}
	const code = char.codePointAt(0);
	return code !== undefined && code >= KATAKANA_MIN && code <= KATAKANA_MAX;
}

// ja: タイトルに使える文字はカタカナ（長音・小書き・濁点半濁点付きを含む）と「×」
// だけに絞る。ひらがなはカタカナへ変換してから残し、それ以外（漢字・英数・空白・
// 記号など）は取り除く。半角カタカナ・半角記号は NFKC で全角へそろえてから判定する。
export function normalizeTitle(input: string): string {
	const katakana = hiraganaToKatakana(input.normalize("NFKC"));
	return Array.from(katakana).filter(isAllowedTitleChar).join("");
}

export type TitleLayoutOptions = {
	// ja: グリフ 1 マスの一辺（px）。
	cellSize: number;
	gap: number;
	maxWidth: number;
	// ja: タイトル文字の font-size（px）。
	titleFontSize: number;
	// ja: タイトル行とグリフ行の間隔（px）。
	titleGap: number;
};

export type TitleLayout = {
	cells: PlacedToken[];
	width: number;
	height: number;
	// ja: タイトル <text> の x（textAnchor="middle" で使う中心座標）。
	titleX: number;
	// ja: タイトル <text> の y（dominantBaseline="central" で使う中心座標）。
	titleY: number;
};

// ja: タイトル行の高さは font-size に対する比率で決める。上下に余白を持たせ、
// 濁点や句読点がはみ出さないようにする。
const TITLE_ROW_HEIGHT_FACTOR = 1.5;

// ja: アニメ版サブタイトルのように、上段にタイトル・下段にハンター文字を中央揃えで
// 積んだ座標を計算する。グリフは行ごとに独立して中央寄せする（行の幅が違っても、
// それぞれの行が全体の幅の中央に来る）。テキスト幅は文字数×font-size で見積もる。
export function layoutTitle(
	title: string,
	tokens: readonly HunterToken[],
	options: TitleLayoutOptions,
): TitleLayout {
	const { cellSize, gap, maxWidth, titleFontSize, titleGap } = options;
	const glyphLayout = layoutTokens(tokens, { cellSize, gap, maxWidth });
	const hasTitle = title !== "";
	const hasGlyphs = glyphLayout.cells.length > 0;

	const titleWidth = title.length * titleFontSize;
	const width = Math.max(titleWidth, glyphLayout.width);

	const titleRowHeight = hasTitle ? titleFontSize * TITLE_ROW_HEIGHT_FACTOR : 0;
	const titleBlockHeight = hasTitle
		? titleRowHeight + (hasGlyphs ? titleGap : 0)
		: 0;

	const cells = centerRows(
		glyphLayout.cells,
		cellSize,
		width,
		titleBlockHeight,
	);

	return {
		cells,
		width,
		height: titleBlockHeight + glyphLayout.height,
		titleX: width / 2,
		titleY: titleRowHeight / 2,
	};
}

// ja: 行ごとに右端（x + cellSize の最大）を求め、その行だけを幅の中央へ寄せる。
function centerRows(
	cells: readonly PlacedToken[],
	cellSize: number,
	contentWidth: number,
	yOffset: number,
): PlacedToken[] {
	const rowRightEdge = new Map<number, number>();
	for (const cell of cells) {
		const right = cell.x + cellSize;
		const current = rowRightEdge.get(cell.row) ?? 0;
		if (right > current) {
			rowRightEdge.set(cell.row, right);
		}
	}

	return cells.map((cell) => {
		const rowWidth = rowRightEdge.get(cell.row) ?? 0;
		const offset = (contentWidth - rowWidth) / 2;
		return { ...cell, x: cell.x + offset, y: cell.y + yOffset };
	});
}
