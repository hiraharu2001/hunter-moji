import { useState } from "react";
import { useFlashMessage } from "../hooks/useFlashMessage";
import { canCopyText, copyText } from "../lib/clipboard";
import {
	appendChar,
	applyDiacritic,
	canApplyDiacritic,
	canToggleSmall,
	removeLast,
	toggleSmall,
} from "../lib/compose";
import { tokensToKana } from "../lib/convert";
import { hiraganaToKatakana } from "../lib/kana";
import type { HunterToken } from "../lib/tokens";
import { GlyphPalette } from "./GlyphPalette";
import { HunterCanvas } from "./HunterCanvas";

type KanaScript = "hiragana" | "katakana";

export function HunterToKanaView() {
	const [tokens, setTokens] = useState<HunterToken[]>([]);
	const [script, setScript] = useState<KanaScript>("hiragana");
	const [message, flash] = useFlashMessage();
	const kana = tokensToKana(tokens);
	const displayedKana = script === "katakana" ? hiraganaToKatakana(kana) : kana;

	const handleCopyKana = () => {
		if (!canCopyText()) {
			flash("このブラウザではコピーできません");
			return;
		}
		copyText(displayedKana).then(
			() => flash("よみをコピーしました"),
			() => flash("コピーできませんでした"),
		);
	};

	return (
		<section className="view">
			<h2 className="view__title">ハンター文字 → かな</h2>
			<p className="view__lead">
				パレットのハンター文字を押して入力します。濁点・半濁点・小書きは直前の 1
				字に付きます。
			</p>
			<GlyphPalette
				onSelect={(char) => setTokens((prev) => appendChar(prev, char))}
			/>
			<div className="controls">
				<button
					className="controls__button"
					type="button"
					disabled={!canApplyDiacritic(tokens, "dakuten")}
					onClick={() => setTokens((prev) => applyDiacritic(prev, "dakuten"))}
				>
					濁点 ゛
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={!canApplyDiacritic(tokens, "handakuten")}
					onClick={() =>
						setTokens((prev) => applyDiacritic(prev, "handakuten"))
					}
				>
					半濁点 ゜
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={!canToggleSmall(tokens)}
					onClick={() => setTokens((prev) => toggleSmall(prev))}
				>
					小書き
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={tokens.length === 0}
					onClick={() => setTokens((prev) => removeLast(prev))}
				>
					1 字削除
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={tokens.length === 0}
					onClick={() => setTokens([])}
				>
					全消去
				</button>
			</div>
			<HunterCanvas
				tokens={tokens}
				title="入力したハンター文字"
				emptyMessage="パレットから文字を選んでください。"
			/>
			<h3 className="view__subtitle">よみ</h3>
			<div className="controls">
				<button
					className={
						script === "hiragana"
							? "controls__button controls__button--active"
							: "controls__button"
					}
					type="button"
					aria-pressed={script === "hiragana"}
					onClick={() => setScript("hiragana")}
				>
					ひらがな
				</button>
				<button
					className={
						script === "katakana"
							? "controls__button controls__button--active"
							: "controls__button"
					}
					type="button"
					aria-pressed={script === "katakana"}
					onClick={() => setScript("katakana")}
				>
					カタカナ
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={kana === ""}
					onClick={handleCopyKana}
				>
					よみをコピー
				</button>
				<span className="controls__status" aria-live="polite">
					{message}
				</span>
			</div>
			<output className="result">
				{kana === "" ? "（まだ入力がありません）" : displayedKana}
			</output>
		</section>
	);
}
