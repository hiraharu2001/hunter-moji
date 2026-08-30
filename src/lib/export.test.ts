import { describe, expect, it } from "vitest";
import { buildExportSvg } from "./export";

const content = '<g><path d="M0 0"/></g>';

function attribute(markup: string, name: string): string | null {
	return markup.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? null;
}

describe("buildExportSvg", () => {
	it("内容の周りに余白と透かしの帯を足した大きさにする", () => {
		const image = buildExportSvg(content, { width: 400, height: 100 });

		expect(image).toMatchObject({ width: 432, height: 142 });
	});

	it("大きさは viewBox と width / height の両方に入れる", () => {
		const { markup, width, height } = buildExportSvg(content, {
			width: 400,
			height: 100,
		});

		expect(attribute(markup, "viewBox")).toBe(`0 0 ${width} ${height}`);
		expect(attribute(markup, "width")).toBe(String(width));
		expect(attribute(markup, "height")).toBe(String(height));
	});

	it("透かしが収まるよう横幅に下限を設ける", () => {
		const image = buildExportSvg(content, { width: 56, height: 56 });

		expect(image.width).toBe(330);
	});

	it("横幅が下限まで広がったら内容を中央へ寄せる", () => {
		const { markup } = buildExportSvg(content, { width: 56, height: 56 });

		expect(markup).toContain('<g transform="translate(137 16)">');
	});

	it("内容をそのまま余白の内側へ置く", () => {
		const { markup } = buildExportSvg(content, { width: 400, height: 100 });

		expect(markup).toContain(`<g transform="translate(16 16)">${content}</g>`);
	});

	it("出典の透かしを右下に薄い色で描く", () => {
		const { markup } = buildExportSvg(content, { width: 400, height: 100 });
		const text = markup.slice(markup.indexOf("<text"));

		expect(text).toContain("https://hiraharu2001.github.io/hunter-moji/");
		expect(attribute(text, "fill")).toBe("#a89571");
		expect(attribute(text, "text-anchor")).toBe("end");
		expect(attribute(text, "x")).toBe("416");
	});

	it("透かしを SVG リンクにして、クリックでサイトへ飛べるようにする", () => {
		const { markup } = buildExportSvg(content, { width: 400, height: 100 });

		expect(markup).toContain(
			'<a href="https://hiraharu2001.github.io/hunter-moji/"><text',
		);
		expect(markup).toContain("</text></a>");
	});

	it("透かしは内容より下の帯に置く", () => {
		const { markup, height } = buildExportSvg(content, {
			width: 400,
			height: 100,
		});
		const text = markup.slice(markup.indexOf("<text"));
		const baseline = Number(attribute(text, "y"));

		expect(baseline).toBeGreaterThan(16 + 100);
		expect(baseline).toBeLessThan(height);
	});

	it("CSS が無くても同じ絵になるよう色と名前空間を属性で持つ", () => {
		const { markup } = buildExportSvg(content, { width: 400, height: 100 });

		expect(attribute(markup, "xmlns")).toBe("http://www.w3.org/2000/svg");
		expect(attribute(markup, "color")).toBe("#3b2f1e");
		expect(markup).toContain('fill="#fbf6e9"');
	});
});
