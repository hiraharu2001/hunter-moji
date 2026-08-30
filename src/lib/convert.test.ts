import { describe, expect, it } from "vitest";
import {
	normalizeKana,
	tokensToKana,
	toTokens,
	unsupportedChars,
} from "./convert";
import {
	BASE_CHARS,
	DAKUTEN_TO_BASE,
	HANDAKUTEN_TO_BASE,
	SMALL_TO_BASE,
} from "./kana";
import { glyphToken } from "./tokens";

describe("normalizeKana", () => {
	it("結合文字の濁点を 1 文字の濁音にまとめる", () => {
		// ja: 「か」+ 結合用濁点（U+3099）。NFC で 1 文字にまとまることを確かめる。
		const decomposed = "\u304B\u3099";

		expect(normalizeKana(decomposed)).toBe("が");
	});

	it("全角スペースとタブを半角スペースに、CRLF を改行にそろえる", () => {
		expect(normalizeKana("あ　い\tう\r\nえ")).toBe("あ い う\nえ");
	});

	it("全角カタカナをひらがなへ変換する", () => {
		expect(normalizeKana("ハンターモジ")).toBe("はんたーもじ");
	});

	it("半角カタカナを全角へ寄せたうえでひらがなへ変換する", () => {
		expect(normalizeKana("ﾊﾝﾀｰ")).toBe("はんたー");
	});

	it("半角カタカナの濁点・半濁点を 1 文字に合成してからひらがなへ変換する", () => {
		expect(normalizeKana("ﾊﾞ")).toBe("ば");
	});

	it("ヴはゔへ変換する", () => {
		expect(normalizeKana("ヴ")).toBe("ゔ");
	});

	it("ヵ・ヶは小書きひらがなが無いため、か・けへ寄せる", () => {
		expect(normalizeKana("ヵヶ")).toBe("かけ");
	});
});

describe("toTokens", () => {
	it("清音は基字だけのトークンになる", () => {
		expect(toTokens("あき")).toEqual([glyphToken("あ"), glyphToken("き")]);
	});

	it("濁音を基字と濁点に分解する", () => {
		expect(toTokens("が")).toEqual([
			glyphToken("か", { diacritic: "dakuten" }),
		]);
	});

	it("半濁音を基字と半濁点に分解する", () => {
		expect(toTokens("ぽ")).toEqual([
			glyphToken("ほ", { diacritic: "handakuten" }),
		]);
	});

	it("小書きを基字と縮小指定に分解する", () => {
		expect(toTokens("っゃ")).toEqual([
			glyphToken("つ", { small: true }),
			glyphToken("や", { small: true }),
		]);
	});

	it("長音と句読点はそのまま字形を持つ文字として扱う", () => {
		expect(toTokens("ー、。")).toEqual([
			glyphToken("ー"),
			glyphToken("、"),
			glyphToken("。"),
		]);
	});

	it("空白と改行はレイアウト用のトークンにする", () => {
		expect(toTokens("あ い\nう")).toEqual([
			glyphToken("あ"),
			{ kind: "space" },
			glyphToken("い"),
			{ kind: "newline" },
			glyphToken("う"),
		]);
	});

	it("漢字・英数字は未対応文字として残す", () => {
		expect(toTokens("念1")).toEqual([
			{ kind: "unsupported", char: "念" },
			{ kind: "unsupported", char: "1" },
		]);
	});
});

describe("カタカナ入力", () => {
	it("全角カタカナはひらがなと同じトークン列になる", () => {
		expect(toTokens("ハンターモジ")).toEqual(toTokens("はんたーもじ"));
	});

	it("半角カタカナはひらがなと同じトークン列になる", () => {
		expect(toTokens("ﾊﾝﾀｰ")).toEqual(toTokens("はんたー"));
	});

	it("拗音を含むカタカナは小書きトークンに分解する", () => {
		expect(toTokens("キャラクター")).toEqual(toTokens("きゃらくたー"));
		expect(toTokens("キャラクター")).toContainEqual(
			glyphToken("や", { small: true }),
		);
	});

	it("ヴは基字「う」に濁点を付けたトークンになる", () => {
		expect(toTokens("ヴ")).toEqual([
			glyphToken("う", { diacritic: "dakuten" }),
		]);
	});

	it("漢字・カタカナと未対応の記号が混ざっていても未対応文字だけを残す", () => {
		expect(unsupportedChars(toTokens("タビダチ×ト×ナカマタチ"))).toEqual(["×"]);
	});
});

describe("unsupportedChars", () => {
	it("未対応文字を出現順に重複なく返す", () => {
		expect(unsupportedChars(toTokens("念あ念力"))).toEqual(["念", "力"]);
	});

	it("対応文字だけなら空になる", () => {
		expect(unsupportedChars(toTokens("ごんさん、こんにちは。"))).toEqual([]);
	});
});

describe("tokensToKana", () => {
	it("分解したトークンからひらがなを組み立て直す", () => {
		const tokens = [
			glyphToken("か", { diacritic: "dakuten" }),
			glyphToken("つ", { small: true }),
			glyphToken("は", { diacritic: "handakuten" }),
		];

		expect(tokensToKana(tokens)).toBe("がっぱ");
	});

	it("未対応文字は元の文字のまま戻す", () => {
		expect(tokensToKana(toTokens("念 A"))).toBe("念 A");
	});
});

describe("往復変換", () => {
	const supported = [
		...BASE_CHARS,
		...Object.keys(DAKUTEN_TO_BASE),
		...Object.keys(HANDAKUTEN_TO_BASE),
		...Object.keys(SMALL_TO_BASE),
	];

	it.each(supported)("対応文字 %s は往復しても変わらない", (char) => {
		expect(tokensToKana(toTokens(char))).toBe(char);
	});

	it("対応文字・記号・未対応文字が混ざった無作為な文字列でも往復で一致する", () => {
		const alphabet = [...supported, " ", "\n", "念", "ア", "A", "7"];
		const random = seededRandom(20260829);

		for (let trial = 0; trial < 500; trial += 1) {
			const length = Math.floor(random() * 24);
			const source = Array.from(
				{ length },
				() => alphabet[Math.floor(random() * alphabet.length)],
			).join("");

			expect(tokensToKana(toTokens(source))).toBe(normalizeKana(source));
		}
	});
});

// ja: 失敗を再現できるよう、乱数は種を固定した線形合同法で作る。
function seededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}
