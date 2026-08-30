import type { GlyphToken } from "../lib/tokens";
import { GlyphShape } from "./GlyphShape";

type Props = {
	token: GlyphToken;
	label: string;
	size?: number;
};

// ja: パレットや対応表で 1 文字だけを見せるときの SVG。
export function GlyphTile({ token, label, size = 48 }: Props) {
	return (
		<svg
			className="glyph-tile"
			viewBox="0 0 100 100"
			width={size}
			height={size}
			role="img"
		>
			<title>{label}</title>
			<GlyphShape token={token} />
		</svg>
	);
}
