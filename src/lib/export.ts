const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// ja: 明るい背景に濃い線で書き出す。画面のテーマに関係なく同じ絵にするため固定値にする。
const EXPORT_COLOR = "#3b2f1e";
const EXPORT_BACKGROUND = "#fbf6e9";
// ja: 出典の透かし。書き出した先では CSS 変数を解決できないため、画面の --faint と
// 同じ色を直に書く。字体も webfont は読み込めないので総称ファミリだけにする。
// SVG として保存・共有したときはクリック可能なリンクにする（PNG はラスタなので
// リンクにはならない）。
const WATERMARK_TEXT = "https://hiraharu2001.github.io/hunter-moji/";
const WATERMARK_COLOR = "#a89571";
const WATERMARK_FONT = "system-ui, sans-serif";
const WATERMARK_FONT_SIZE = 11;
// ja: 内容の周りに空ける余白と、下辺に足す透かし用の帯（余白を含む）。
const PADDING = 16;
const FOOTER = 26;
// ja: 1 文字だけ書き出したときに透かしがはみ出さないよう、横幅に下限を設ける。
const MIN_WIDTH = 330;
// ja: 画面の 2 倍で描いて、拡大しても線が粗くならないようにする。
const PNG_SCALE = 2;

export type ExportImage = {
	markup: string;
	width: number;
	height: number;
};

export type ContentSize = {
	width: number;
	height: number;
};

// ja: 画面の SVG の中身に、余白・背景・透かしを足した 1 枚の SVG を組み立てる。PNG も
// この文字列をラスタライズして作るので、SVG と PNG の見た目は必ず一致する。
export function buildExportSvg(
	content: string,
	size: ContentSize,
): ExportImage {
	const width = Math.max(size.width + PADDING * 2, MIN_WIDTH);
	const height = size.height + PADDING + FOOTER;
	const offsetX = (width - size.width) / 2;
	const baseline = height - FOOTER / 2 + WATERMARK_FONT_SIZE / 3;

	return {
		markup: [
			`<svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 ${width} ${height}"`,
			` width="${width}" height="${height}" color="${EXPORT_COLOR}">`,
			`<rect x="0" y="0" width="${width}" height="${height}"`,
			` fill="${EXPORT_BACKGROUND}"/>`,
			`<g transform="translate(${offsetX} ${PADDING})">${content}</g>`,
			`<a href="${WATERMARK_TEXT}">`,
			`<text x="${width - PADDING}" y="${baseline}" text-anchor="end"`,
			` font-family="${WATERMARK_FONT}" font-size="${WATERMARK_FONT_SIZE}"`,
			` fill="${WATERMARK_COLOR}">${WATERMARK_TEXT}</text>`,
			"</a>",
			"</svg>",
		].join(""),
		width,
		height,
	};
}

// ja: 画面の SVG から中身だけを取り出す。書き出し側で付け直すので title は落とす。
export function svgContent(svg: SVGSVGElement): string {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	for (const title of Array.from(clone.querySelectorAll("title"))) {
		title.remove();
	}
	const serializer = new XMLSerializer();
	return Array.from(clone.childNodes)
		.map((node) => serializer.serializeToString(node))
		.join("");
}

export function svgSize(svg: SVGSVGElement): ContentSize {
	const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);
	if (
		viewBox?.length === 4 &&
		viewBox.every((value) => Number.isFinite(value))
	) {
		return { width: viewBox[2], height: viewBox[3] };
	}
	const rect = svg.getBoundingClientRect();
	return { width: rect.width, height: rect.height };
}

// ja: 画面の SVG を PNG にする。ユーザー操作と同じタスクで呼べるよう、await せずに
// Promise を返す（Safari のクリップボードは操作直後の write しか許さない）。
export function svgToPng(svg: SVGSVGElement): Promise<Blob> {
	return renderPng(buildExportSvg(svgContent(svg), svgSize(svg)));
}

async function renderPng(image: ExportImage): Promise<Blob> {
	const url = URL.createObjectURL(
		new Blob([image.markup], { type: "image/svg+xml;charset=utf-8" }),
	);
	try {
		const loaded = await loadImage(url);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.ceil(image.width * PNG_SCALE));
		canvas.height = Math.max(1, Math.ceil(image.height * PNG_SCALE));
		const context = canvas.getContext("2d");
		if (context === null) {
			throw new Error("canvas の 2d コンテキストを取得できませんでした");
		}
		context.fillStyle = EXPORT_BACKGROUND;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(loaded, 0, 0, canvas.width, canvas.height);
		return await canvasToBlob(canvas);
	} finally {
		URL.revokeObjectURL(url);
	}
}

export function downloadBlob(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () =>
			reject(new Error("SVG を画像として読み込めませんでした"));
		image.src = url;
	});
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob === null) {
				reject(new Error("PNG を生成できませんでした"));
				return;
			}
			resolve(blob);
		}, "image/png");
	});
}
