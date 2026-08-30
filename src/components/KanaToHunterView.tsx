import { useId, useMemo, useRef, useState } from "react";
import { toTokens, unsupportedChars } from "../lib/convert";
import { parseHash } from "../lib/share";
import { HunterCanvas } from "./HunterCanvas";
import { ResultActions } from "./ResultActions";

const SAMPLE_TEXT = "はんたーもじへ、ようこそ。";

// ja: 共有リンクで開いたときは、その本文を初期値にする。
function initialText(): string {
	const shared = parseHash(window.location.hash).text;
	return shared === "" ? SAMPLE_TEXT : shared;
}

export function KanaToHunterView() {
	const [text, setText] = useState(initialText);
	const inputId = useId();
	const svgRef = useRef<SVGSVGElement>(null);
	const tokens = useMemo(() => toTokens(text), [text]);
	const unsupported = useMemo(() => unsupportedChars(tokens), [tokens]);

	return (
		<section className="view">
			<h2 className="view__title">かな → ハンター文字</h2>
			<label className="field__label" htmlFor={inputId}>
				ひらがな・カタカナを入力すると、その場でハンター文字になります。
			</label>
			<textarea
				className="field__textarea"
				id={inputId}
				rows={3}
				value={text}
				placeholder="ひらがな・カタカナで入力してください"
				onChange={(event) => setText(event.target.value)}
			/>
			{unsupported.length > 0 && (
				<p className="warning" role="alert">
					<span className="warning__chars">{unsupported.join(" ")}</span>
					は対応していません。ひらがな・カタカナに直してください。
				</p>
			)}
			<HunterCanvas
				tokens={tokens}
				title="変換したハンター文字"
				emptyMessage="ここに変換結果が出ます。"
				svgRef={svgRef}
			/>
			<ResultActions
				svgRef={svgRef}
				fileName="hunter-moji"
				tab="to-hunter"
				text={text}
				disabled={tokens.length === 0}
			/>
		</section>
	);
}
