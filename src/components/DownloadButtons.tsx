import { type RefObject, useState } from "react";
import {
	downloadBlob,
	serializeSvg,
	svgSize,
	svgToPngBlob,
} from "../lib/download";

// ja: 明るい背景に濃い線で書き出す。画面のテーマに関係なく同じ絵にするため固定値にする。
const EXPORT_COLOR = "#3b2f1e";
const EXPORT_BACKGROUND = "#fbf6e9";
// ja: 画面の 2 倍で描いて、拡大しても線が粗くならないようにする。
const PNG_SCALE = 2;

type Props = {
	svgRef: RefObject<SVGSVGElement | null>;
	fileName: string;
	disabled: boolean;
};

export function DownloadButtons({ svgRef, fileName, disabled }: Props) {
	const [error, setError] = useState<string | null>(null);

	const saveSvg = () => {
		const svg = svgRef.current;
		if (svg === null) {
			return;
		}
		setError(null);
		const source = serializeSvg(svg, EXPORT_COLOR);
		downloadBlob(
			new Blob([source], { type: "image/svg+xml" }),
			`${fileName}.svg`,
		);
	};

	const savePng = async () => {
		const svg = svgRef.current;
		if (svg === null) {
			return;
		}
		setError(null);
		const [width, height] = svgSize(svg);
		try {
			const blob = await svgToPngBlob(serializeSvg(svg, EXPORT_COLOR), {
				width,
				height,
				scale: PNG_SCALE,
				background: EXPORT_BACKGROUND,
			});
			downloadBlob(blob, `${fileName}.png`);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "PNG を保存できませんでした",
			);
		}
	};

	return (
		<div className="controls">
			<button
				className="controls__button"
				type="button"
				disabled={disabled}
				onClick={saveSvg}
			>
				SVG で保存
			</button>
			<button
				className="controls__button"
				type="button"
				disabled={disabled}
				onClick={() => {
					void savePng();
				}}
			>
				PNG で保存
			</button>
			{error !== null && (
				<p className="warning" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
