const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// ja: 画面に描いた SVG をそのまま書き出す。外部 CSS に依存しないよう色と寸法を属性で固定する。
export function serializeSvg(svg: SVGSVGElement, color: string): string {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	const [width, height] = svgSize(svg);
	clone.setAttribute("xmlns", SVG_NAMESPACE);
	clone.setAttribute("width", String(width));
	clone.setAttribute("height", String(height));
	// ja: currentColor を解決させるため、ルートに color を直接指定する。
	clone.setAttribute("color", color);
	return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

export function svgSize(svg: SVGSVGElement): [number, number] {
	const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);
	if (
		viewBox?.length === 4 &&
		viewBox.every((value) => Number.isFinite(value))
	) {
		return [viewBox[2], viewBox[3]];
	}
	const rect = svg.getBoundingClientRect();
	return [rect.width, rect.height];
}

export async function svgToPngBlob(
	source: string,
	options: { width: number; height: number; scale: number; background: string },
): Promise<Blob> {
	const url = URL.createObjectURL(
		new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
	);
	try {
		const image = await loadImage(url);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.ceil(options.width * options.scale));
		canvas.height = Math.max(1, Math.ceil(options.height * options.scale));
		const context = canvas.getContext("2d");
		if (context === null) {
			throw new Error("canvas の 2d コンテキストを取得できませんでした");
		}
		context.fillStyle = options.background;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
