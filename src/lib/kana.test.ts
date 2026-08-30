import { describe, expect, it } from "vitest";
import { hiraganaToKatakana } from "./kana";

describe("hiraganaToKatakana", () => {
	it("小書き・濁音・記号を含むひらがなをカタカナへ変換する", () => {
		expect(hiraganaToKatakana("きゃらくたーゔぇ、")).toBe("キャラクターヴェ、");
	});
});
