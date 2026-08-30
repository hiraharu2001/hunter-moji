import { describe, expect, it } from "vitest";
import {
	buildShareUrl,
	canBuildShareUrl,
	parseHash,
	SHARE_TEXT_LIMIT,
} from "./share";

const PAGE_URL = "https://hiraharu2001.github.io/hunter-moji/#/to-kana";

describe("parseHash", () => {
	it("本文が付いていても画面を取り違えない", () => {
		expect(parseHash("#/to-kana?t=%E3%81%82").path).toBe("to-kana");
	});

	it("本文を復号して返す", () => {
		expect(parseHash("#/to-hunter?t=%E3%81%82%20%E3%81%84").text).toBe("あ い");
	});

	it("本文が無ければ空文字を返す", () => {
		expect(parseHash("#/to-hunter")).toEqual({ path: "to-hunter", text: "" });
	});

	it("hash が空でも壊れない", () => {
		expect(parseHash("")).toEqual({ path: "", text: "" });
	});

	it("知らないクエリが混ざっていても本文だけを取り出す", () => {
		expect(parseHash("#/to-hunter?x=1&t=%E3%81%82").text).toBe("あ");
	});
});

describe("buildShareUrl", () => {
	it("今の画面と本文を載せた URL を組み立てる", () => {
		expect(buildShareUrl(PAGE_URL, "to-hunter", "あ")).toBe(
			"https://hiraharu2001.github.io/hunter-moji/#/to-hunter?t=%E3%81%82",
		);
	});

	it("組み立てた URL は parseHash で元に戻せる", () => {
		const text = "はんたー もじ\nへ、";
		const url = new URL(buildShareUrl(PAGE_URL, "to-hunter", text));

		expect(parseHash(url.hash)).toEqual({ path: "to-hunter", text });
	});

	it("本文が空なら画面だけの URL にする", () => {
		expect(buildShareUrl(PAGE_URL, "to-hunter", "")).toBe(
			"https://hiraharu2001.github.io/hunter-moji/#/to-hunter",
		);
	});
});

describe("canBuildShareUrl", () => {
	it("本文が空なら作れない", () => {
		expect(canBuildShareUrl("")).toBe(false);
	});

	it("上限までは作れる", () => {
		expect(canBuildShareUrl("あ".repeat(SHARE_TEXT_LIMIT))).toBe(true);
	});

	it("上限を超えたら作れない", () => {
		expect(canBuildShareUrl("あ".repeat(SHARE_TEXT_LIMIT + 1))).toBe(false);
	});
});
