import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSharedText } from "../hooks/useSharedText";
import { toTokens } from "../lib/convert";
import { normalizeTitle } from "../lib/title";
import { ResultActions } from "./ResultActions";
import { TitleCanvas } from "./TitleCanvas";

const SAMPLE_TITLE = "ハンターモジ×ヘ×ヨウコソ";

export function TitleView() {
	const shared = useSharedText();
	// ja: 共有リンクで開いたときは、その本文を入力欄に入れる。
	const [title, setTitle] = useState(
		shared === "" ? SAMPLE_TITLE : normalizeTitle(shared),
	);
	useEffect(() => {
		if (shared !== "") {
			setTitle(normalizeTitle(shared));
		}
	}, [shared]);

	const inputId = useId();
	const svgRef = useRef<SVGSVGElement>(null);
	const tokens = useMemo(() => toTokens(title), [title]);

	return (
		<section className="view">
			<h2 className="view__title">タイトル風</h2>
			<p className="view__lead">
				アニメ版のサブタイトルのように、タイトルとハンター文字を重ねて表示します。
				使える文字はカタカナと「×」だけで、ひらがなはカタカナへ変換し、それ以外の文字は取り除きます。
			</p>
			<label className="field__label" htmlFor={inputId}>
				タイトル
			</label>
			<input
				className="field__input"
				id={inputId}
				type="text"
				value={title}
				placeholder="ハンターモジ×ヘ×ヨウコソ"
				onChange={(event) => setTitle(normalizeTitle(event.target.value))}
			/>
			<TitleCanvas
				title={title}
				tokens={tokens}
				emptyMessage="ここに変換結果が出ます。"
				svgRef={svgRef}
			/>
			<ResultActions
				svgRef={svgRef}
				fileName="hunter-title"
				tab="title"
				text={title}
				disabled={title === ""}
			/>
		</section>
	);
}
