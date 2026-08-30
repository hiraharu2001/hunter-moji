// ja: 結果画面の操作のうち、ブラウザの機能で出し分けるものを決める。判定に使う値は
// 引数で受け取り、window や navigator をここでは直に見ない。

// ja: 判定に使う window の一部。テストでは組み合わせを作って渡す。
export type ActionEnvironment = {
	isSecureContext?: boolean;
	navigator?: {
		share?: unknown;
	};
};

export type ResultActionAvailability = {
	// ja: 共有シートを開けるか。画像を共有できるかは端末次第なので、クリック時に
	// あらためて確かめる。
	share: boolean;
	// ja: HTTPS で開き直せば操作が増えることを伝えるか。
	insecureNote: boolean;
};

// ja: Web Share API もクリップボードもセキュアコンテキスト専用で、http で開くと
// navigator.share ごと存在しない。共有ボタンの表示は share の有無とセキュア
// コンテキストの両方で決める。
export function resolveResultActions(
	env: ActionEnvironment,
): ResultActionAvailability {
	return {
		share:
			env.isSecureContext === true &&
			typeof env.navigator?.share === "function",
		insecureNote: env.isSecureContext === false,
	};
}
