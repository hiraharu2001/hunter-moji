import { toTokens } from "../lib/convert";
import {
	DAKUTEN_TO_BASE,
	GOJUON_ROWS,
	HANDAKUTEN_TO_BASE,
	PUNCTUATION,
	SMALL_TO_BASE,
	VOWEL_LABELS,
} from "../lib/kana";
import { GlyphTile } from "./GlyphTile";

export function ChartView() {
	return (
		<section className="view">
			<h2 className="view__title">五十音対応表</h2>
			<h3 className="view__subtitle">清音</h3>
			<div className="chart">
				{GOJUON_ROWS.map((row) => (
					<div className="chart__row" key={row.label}>
						<span className="chart__label">{row.label}</span>
						{row.chars.map((char, index) =>
							char === null ? (
								<span
									className="chart__blank"
									key={`${row.label}-${VOWEL_LABELS[index]}`}
								/>
							) : (
								<ChartCell char={char} key={char} />
							),
						)}
					</div>
				))}
			</div>
			<h3 className="view__subtitle">濁音・半濁音</h3>
			<p className="view__note">
				基字の右上に濁点・半濁点のマークを重ねて表します。
			</p>
			<div className="chart chart--flow">
				{[
					...Object.keys(DAKUTEN_TO_BASE),
					...Object.keys(HANDAKUTEN_TO_BASE),
				].map((char) => (
					<ChartCell char={char} key={char} />
				))}
			</div>
			<h3 className="view__subtitle">小書き</h3>
			<p className="view__note">同じ字形を縮小して表します。</p>
			<div className="chart chart--flow">
				{Object.keys(SMALL_TO_BASE).map((char) => (
					<ChartCell char={char} key={char} />
				))}
			</div>
			<h3 className="view__subtitle">記号</h3>
			<div className="chart chart--flow">
				{PUNCTUATION.map((char) => (
					<ChartCell char={char} key={char} />
				))}
			</div>
		</section>
	);
}

function ChartCell({ char }: { char: string }) {
	const token = toTokens(char)[0];
	if (token === undefined || token.kind !== "glyph") {
		return null;
	}

	return (
		<figure className="chart__cell">
			<GlyphTile token={token} label={char} size={56} />
			<figcaption className="chart__caption">{char}</figcaption>
		</figure>
	);
}
