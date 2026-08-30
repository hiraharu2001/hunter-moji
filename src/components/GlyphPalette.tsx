import { GOJUON_ROWS, PUNCTUATION, VOWEL_LABELS } from "../lib/kana";
import { glyphToken } from "../lib/tokens";
import { GlyphTile } from "./GlyphTile";

type Props = {
	onSelect: (char: string) => void;
};

type Cell = {
	id: string;
	char: string | null;
};

// ja: 五十音順のグリフパレット。押した字はそのまま入力の末尾に足す。
export function GlyphPalette({ onSelect }: Props) {
	return (
		<div className="palette">
			{GOJUON_ROWS.map((row) => (
				<div className="palette__row" key={row.label}>
					<span className="palette__label">{row.label}</span>
					{withVowelIds(row.label, row.chars).map((cell) =>
						cell.char === null ? (
							<span className="palette__blank" key={cell.id} />
						) : (
							<PaletteButton
								char={cell.char}
								key={cell.id}
								onSelect={onSelect}
							/>
						),
					)}
				</div>
			))}
			<div className="palette__row">
				<span className="palette__label">記号</span>
				{PUNCTUATION.map((char) => (
					<PaletteButton char={char} key={char} onSelect={onSelect} />
				))}
			</div>
		</div>
	);
}

function PaletteButton({
	char,
	onSelect,
}: {
	char: string;
	onSelect: (char: string) => void;
}) {
	return (
		<button
			className="palette__button"
			type="button"
			onClick={() => onSelect(char)}
		>
			<GlyphTile token={glyphToken(char)} label={char} size={44} />
			<span className="palette__kana">{char}</span>
		</button>
	);
}

function withVowelIds(
	rowLabel: string,
	chars: ReadonlyArray<string | null>,
): Cell[] {
	return chars.map((char, index) => ({
		id: `${rowLabel}-${VOWEL_LABELS[index]}`,
		char,
	}));
}
