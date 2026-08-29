import { describe, expect, it } from "vitest";
import { toTokens } from "./convert";
import { layoutTokens } from "./layout";

// ja: 1 マス 40px・間隔 10px なら 1 行 4 マス（40*4 + 10*3 = 190 <= 190）に収まる。
const options = { cellSize: 40, gap: 10, maxWidth: 190 };

describe("layoutTokens", () => {
	it("幅に収まる数で列を決める", () => {
		expect(layoutTokens(toTokens("あ"), options).columns).toBe(4);
	});

	it("マス目の左上座標を間隔込みで返す", () => {
		const { cells } = layoutTokens(toTokens("あい"), options);

		expect(cells.map((cell) => [cell.x, cell.y])).toEqual([
			[0, 0],
			[50, 0],
		]);
	});

	it("列数を超えたら次の行へ折り返す", () => {
		const { cells } = layoutTokens(toTokens("あいうえお"), options);

		expect(cells.at(-1)).toMatchObject({ column: 0, row: 1, x: 0, y: 50 });
	});

	it("空白は 1 マス空けるだけでマス目を作らない", () => {
		const { cells } = layoutTokens(toTokens("あ い"), options);

		expect(cells).toHaveLength(2);
		expect(cells.at(-1)).toMatchObject({ column: 2, row: 0 });
	});

	it("改行で次の行の先頭へ送る", () => {
		const { cells } = layoutTokens(toTokens("あ\nい"), options);

		expect(cells.at(-1)).toMatchObject({ column: 0, row: 1 });
	});

	it("使ったマス目の分だけの大きさを返す", () => {
		expect(layoutTokens(toTokens("あい"), options)).toMatchObject({
			width: 90,
			height: 40,
		});
	});

	it("入力が空なら大きさは 0 になる", () => {
		expect(layoutTokens([], options)).toMatchObject({
			cells: [],
			width: 0,
			height: 0,
		});
	});

	it("幅が 1 マスに満たなくても 1 列は確保する", () => {
		expect(
			layoutTokens(toTokens("あ"), { cellSize: 40, gap: 10, maxWidth: 0 })
				.columns,
		).toBe(1);
	});
});
