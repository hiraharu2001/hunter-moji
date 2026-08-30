// ja: 塗りつぶしの円。線では描けない「い段」の黒丸と濁点に使う。
export type Dot = {
	cx: number;
	cy: number;
	r: number;
};

export type Glyph = {
	char: string;
	paths: string[];
	dots?: Dot[];
};
