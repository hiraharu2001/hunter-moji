import { type RefObject, useState } from "react";
import { useFlashMessage } from "../hooks/useFlashMessage";
import type { TabId } from "../hooks/useHashRoute";
import { resolveResultActions } from "../lib/capabilities";
import {
	canCopyImage,
	canCopyText,
	copyImage,
	copyText,
	isAbort,
	shareImage,
} from "../lib/clipboard";
import { downloadBlob, svgToPng } from "../lib/export";
import {
	buildShareUrl,
	canBuildShareUrl,
	SHARE_TEXT_LIMIT,
} from "../lib/share";

type Props = {
	svgRef: RefObject<SVGSVGElement | null>;
	fileName: string;
	tab: TabId;
	text: string;
	disabled: boolean;
};

// ja: 変換結果に対する操作をまとめる。主役は「画像をコピー」で、コピーできない
// ブラウザでは同じ画像の保存へ落とす。
export function ResultActions({
	svgRef,
	fileName,
	tab,
	text,
	disabled,
}: Props) {
	const [message, flash] = useFlashMessage();
	const [error, setError] = useState<string | null>(null);
	// ja: 使える操作はブラウザで決まるため、マウント時に一度だけ調べて持ち回る。
	const [available] = useState(() => resolveResultActions(window));

	// ja: ユーザー操作と同じタスクで PNG の生成を始め、await せずに Promise を返す。
	const startRender = (): Promise<Blob> | null => {
		const svg = svgRef.current;
		if (svg === null) {
			return null;
		}
		setError(null);
		return svgToPng(svg);
	};

	const savePng = (png: Promise<Blob>, note: string): void => {
		png.then(
			(blob) => {
				downloadBlob(blob, `${fileName}.png`);
				flash(note);
			},
			(cause) => setError(toMessage(cause, "画像を作れませんでした")),
		);
	};

	const handleCopyImage = () => {
		const png = startRender();
		if (png === null) {
			return;
		}
		if (!canCopyImage()) {
			savePng(png, "コピーに対応していないため保存しました");
			return;
		}
		copyImage(png).then(
			() => flash("画像をコピーしました"),
			() => savePng(png, "コピーできなかったため保存しました"),
		);
	};

	const handleSaveImage = () => {
		const png = startRender();
		if (png !== null) {
			savePng(png, "画像を保存しました");
		}
	};

	// ja: 画像を共有できない端末では共有リンクへ、リンクも作れなければ保存へ落とす。
	const handleShareImage = () => {
		const png = startRender();
		if (png === null) {
			return;
		}
		const link = canBuildShareUrl(text)
			? buildShareUrl(window.location.href, tab, text)
			: null;
		shareImage(png, `${fileName}.png`, link).then(
			(result) => {
				if (result === "url") {
					flash("リンクを共有しました");
				}
				if (result === "unsupported") {
					savePng(png, "共有できない形式のため保存しました");
				}
			},
			(cause) => {
				if (!isAbort(cause)) {
					savePng(png, "共有できなかったため保存しました");
				}
			},
		);
	};

	const handleCopyLink = () => {
		if (!canCopyText()) {
			setError("このブラウザではリンクをコピーできません");
			return;
		}
		setError(null);
		copyText(buildShareUrl(window.location.href, tab, text)).then(
			() => flash("リンクをコピーしました"),
			() => setError("リンクをコピーできませんでした"),
		);
	};

	return (
		<div className="actions">
			<div className="controls">
				<button
					className="controls__button controls__button--primary"
					type="button"
					disabled={disabled}
					onClick={handleCopyImage}
				>
					画像をコピー
				</button>
				<button
					className="controls__button"
					type="button"
					disabled={disabled}
					onClick={handleSaveImage}
				>
					画像を保存
				</button>
				{available.share && (
					<button
						className="controls__button"
						type="button"
						disabled={disabled}
						onClick={handleShareImage}
					>
						共有
					</button>
				)}
				<button
					className="controls__button"
					type="button"
					disabled={!canBuildShareUrl(text)}
					onClick={handleCopyLink}
				>
					リンクをコピー
				</button>
				<span className="controls__status" aria-live="polite">
					{message}
				</span>
			</div>
			{available.insecureNote && (
				<p className="view__note">
					HTTPS で開くと、画像のコピーと共有が使えます。
				</p>
			)}
			{text.length > SHARE_TEXT_LIMIT && (
				<p className="view__note">
					本文が {SHARE_TEXT_LIMIT} 字を超えるため、共有リンクは作れません。
				</p>
			)}
			{error !== null && (
				<p className="warning" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

function toMessage(cause: unknown, fallback: string): string {
	return cause instanceof Error ? cause.message : fallback;
}
