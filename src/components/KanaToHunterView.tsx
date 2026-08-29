import { useId, useMemo, useRef, useState } from "react";
import { toTokens, unsupportedChars } from "../lib/convert";
import { DownloadButtons } from "./DownloadButtons";
import { HunterCanvas } from "./HunterCanvas";

const SAMPLE_TEXT = "はんたーもじへ、ようこそ。";

export function KanaToHunterView() {
	const [text, setText] = useState(SAMPLE_TEXT);
	const inputId = useId();
	const svgRef = useRef<SVGSVGElement>(null);
	const tokens = useMemo(() => toTokens(text), [text]);
	const unsupported = useMemo(() => unsupportedChars(tokens), [tokens]);

	return (
		<section className="view">
			<h2 className="view__title">ひらがな → ハンター文字</h2>
			<label className="field__label" htmlFor={inputId}>
				ひらがなを入力すると、その場でハンター文字になります。
			</label>
			<textarea
				className="field__textarea"
				id={inputId}
				rows={3}
				value={text}
				placeholder="ひらがなで入力してください"
				onChange={(event) => setText(event.target.value)}
			/>
			{unsupported.length > 0 && (
				<p className="warning" role="alert">
					<span className="warning__chars">{unsupported.join(" ")}</span>
					は対応していません。ひらがなに直してください。
				</p>
			)}
			<HunterCanvas
				tokens={tokens}
				title="変換したハンター文字"
				emptyMessage="ここに変換結果が出ます。"
				svgRef={svgRef}
			/>
			<DownloadButtons
				svgRef={svgRef}
				fileName="hunter-moji"
				disabled={tokens.length === 0}
			/>
		</section>
	);
}
