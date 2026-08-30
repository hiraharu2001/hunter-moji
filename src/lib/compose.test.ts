import { describe, expect, it } from "vitest";
import {
	appendChar,
	applyDiacritic,
	canApplyDiacritic,
	canToggleSmall,
	removeLast,
	toggleSmall,
} from "./compose";
import { tokensToKana } from "./convert";
import { glyphToken } from "./tokens";

describe("appendChar", () => {
	it("パレットで選んだ基字を末尾に足す", () => {
		expect(appendChar([glyphToken("あ")], "か")).toEqual([
			glyphToken("あ"),
			glyphToken("か"),
		]);
	});
});

describe("removeLast", () => {
	it("末尾の 1 マスを消す", () => {
		expect(removeLast([glyphToken("あ"), glyphToken("か")])).toEqual([
			glyphToken("あ"),
		]);
	});

	it("空の入力を消しても空のまま", () => {
		expect(removeLast([])).toEqual([]);
	});
});

describe("applyDiacritic", () => {
	it("直前の字に濁点を付ける", () => {
		const tokens = applyDiacritic(appendChar([], "か"), "dakuten");

		expect(tokensToKana(tokens)).toBe("が");
	});

	it("同じ濁点をもう一度押すと外れる", () => {
		const tokens = applyDiacritic(
			applyDiacritic(appendChar([], "か"), "dakuten"),
			"dakuten",
		);

		expect(tokensToKana(tokens)).toBe("か");
	});

	it("濁点から半濁点へ付け替えられる", () => {
		const tokens = applyDiacritic(
			applyDiacritic(appendChar([], "は"), "dakuten"),
			"handakuten",
		);

		expect(tokensToKana(tokens)).toBe("ぱ");
	});

	it("濁点を付けられない字には何もしない", () => {
		const tokens = appendChar([], "あ");

		expect(applyDiacritic(tokens, "dakuten")).toEqual(tokens);
	});

	it("入力が空なら何もしない", () => {
		expect(applyDiacritic([], "dakuten")).toEqual([]);
	});
});

describe("canApplyDiacritic", () => {
	it("か行には濁点を付けられる", () => {
		expect(canApplyDiacritic(appendChar([], "か"), "dakuten")).toBe(true);
	});

	it("は行だけが半濁点を付けられる", () => {
		expect(canApplyDiacritic(appendChar([], "は"), "handakuten")).toBe(true);
		expect(canApplyDiacritic(appendChar([], "か"), "handakuten")).toBe(false);
	});

	it("小書きの字には濁点を付けられない", () => {
		expect(
			canApplyDiacritic(toggleSmall(appendChar([], "つ")), "dakuten"),
		).toBe(false);
	});
});

describe("toggleSmall", () => {
	it("小書きにできる字を縮小指定へ切り替える", () => {
		expect(tokensToKana(toggleSmall(appendChar([], "つ")))).toBe("っ");
	});

	it("もう一度押すと元の大きさに戻る", () => {
		expect(tokensToKana(toggleSmall(toggleSmall(appendChar([], "や"))))).toBe(
			"や",
		);
	});

	it("小書きが無い字には何もしない", () => {
		const tokens = appendChar([], "か");

		expect(toggleSmall(tokens)).toEqual(tokens);
	});
});

describe("canToggleSmall", () => {
	it("小書きのある字だけ切り替えられる", () => {
		expect(canToggleSmall(appendChar([], "や"))).toBe(true);
		expect(canToggleSmall(appendChar([], "か"))).toBe(false);
	});

	it("濁点が付いている字は切り替えられない", () => {
		expect(
			canToggleSmall(applyDiacritic(appendChar([], "つ"), "dakuten")),
		).toBe(false);
	});
});
