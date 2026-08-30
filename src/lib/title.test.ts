import { describe, expect, it } from "vitest";
import { toTokens } from "./convert";
import { layoutTitle, normalizeTitle } from "./title";

// ja: cellSize 20・gap 10 なら 1 マスの歩幅（step）は 30。
const options = {
	cellSize: 20,
	gap: 10,
	maxWidth: 1000,
	titleFontSize: 20,
	titleGap: 10,
};

describe("layoutTitle", () => {
	it("タイトルがグリフより広いとき、グリフ行を全体の幅の中央へ寄せる", () => {
		// ja: タイトル 5 字 × font-size 20 = 100。グリフ 2 字は 30(step)+20(cell) = 50。
		const layout = layoutTitle("たびだちと", toTokens("あい"), options);

		expect(layout.width).toBe(100);
		expect(layout.cells.map((cell) => cell.x)).toEqual([25, 55]);
	});

	it("タイトル行の高さぶんグリフ行を下へ送る", () => {
		const layout = layoutTitle("たびだちと", toTokens("あい"), options);

		// ja: titleRowHeight = 20 * 1.5 = 30、titleGap = 10 → yOffset = 40。
		expect(layout.cells.map((cell) => cell.y)).toEqual([40, 40]);
		expect(layout.titleY).toBe(15);
		expect(layout.height).toBe(30 + 10 + 20);
	});

	it("行ごとに幅の違うグリフをそれぞれ中央へ寄せる", () => {
		// ja: 1 行目 2 字（幅 50）、2 行目 1 字（幅 20）。maxWidth を狭めて 2 行に折り返す。
		const layout = layoutTitle("", toTokens("あい\nう"), {
			...options,
			maxWidth: 60,
		});

		expect(layout.width).toBe(50);
		expect(layout.cells).toMatchObject([
			{ row: 0, x: 0 },
			{ row: 0, x: 30 },
			{ row: 1, x: 15 },
		]);
	});

	it("タイトルが空ならタイトル行の高さを持たない", () => {
		const layout = layoutTitle("", toTokens("あ"), options);

		expect(layout.height).toBe(20);
		expect(layout.cells[0]).toMatchObject({ y: 0 });
	});

	it("グリフが無くてもタイトルだけの高さになる", () => {
		const layout = layoutTitle("たび", [], options);

		expect(layout.cells).toEqual([]);
		expect(layout.height).toBe(30);
		expect(layout.width).toBe(40);
	});

	it("タイトルもグリフも無ければ大きさは 0", () => {
		const layout = layoutTitle("", [], options);

		expect(layout).toMatchObject({ cells: [], width: 0, height: 0 });
	});
});

describe("normalizeTitle", () => {
	it("ひらがなはカタカナへ変換する", () => {
		expect(normalizeTitle("たびだち")).toBe("タビダチ");
	});

	it("カタカナはそのまま残す", () => {
		expect(normalizeTitle("ヒジョウ×ノ×センジョウ")).toBe(
			"ヒジョウ×ノ×センジョウ",
		);
	});

	it("長音・小書き・濁点半濁点付きのカタカナを残す", () => {
		expect(normalizeTitle("ぱーっしょ")).toBe("パーッショ");
	});

	it("半角カタカナは全角へそろえてから残す", () => {
		expect(normalizeTitle("ﾊﾝﾀｰ")).toBe("ハンター");
	});

	it("漢字・英数・空白・記号は取り除く", () => {
		expect(normalizeTitle("旅立5 to the Sky!？")).toBe("");
	});

	it("許容しない文字だけ除いて、許容する文字は残す", () => {
		expect(normalizeTitle("旅ヒジョウ2×ノ野センジョウ")).toBe(
			"ヒジョウ×ノセンジョウ",
		);
	});

	it("空文字はそのまま空文字", () => {
		expect(normalizeTitle("")).toBe("");
	});

	it("convert.ts が変換できないカタカナ（ヷヸヹヺ）は取り除く", () => {
		expect(normalizeTitle("ヷヸヴヹヺ")).toBe("ヴ");
	});
});
