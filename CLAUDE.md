# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

パッケージマネージャは pnpm（`packageManager: pnpm@10.34.5`）。この環境には pnpm 本体が入っておらず `corepack enable` も Nix の read-only bin で失敗するため、次の形で実行する。

```sh
COREPACK_HOME="$TMPDIR/corepack" corepack pnpm <script>
```

| コマンド | 内容 |
| --- | --- |
| `corepack pnpm dev` | 開発サーバーを起動する |
| `corepack pnpm build` | `tsc -b && vite build`（型検査と本番ビルド） |
| `corepack pnpm preview` | ビルド結果をローカルで確認する |
| `corepack pnpm lint` | `biome check .` |
| `corepack pnpm format` | `biome check --write .` |
| `corepack pnpm test` | `vitest run` |

- 単一ファイルのテスト: `corepack pnpm test src/lib/convert.test.ts`
- テスト名で絞り込み: `corepack pnpm vitest run -t "全角カタカナをひらがなへ変換する"`
- dev サーバーは既存セッションと衝突させないため `--port <n> --strictPort` を付けて起動する。sandbox 下では listen が EPERM になることがある。
- README を作成・更新したら `doclint --format text README.md` を通す。

## アーキテクチャ

**ドメイン**: ハンター文字はかなへの単純置換暗号。ひらがなとカタカナは同じ字形に対応する（`src/lib/kana.ts`）。

**データフロー**: 入力文字列 → `normalizeKana`（NFKC 正規化・カタカナ→ひらがな、`src/lib/convert.ts`）→ `toTokens` でトークン列（`glyph` / `space` / `newline` / `unsupported`、`src/lib/tokens.ts`）→ `HunterCanvas` が `layoutTokens`（`src/lib/layout.ts`）で折り返し座標を計算し、1 枚の SVG に `GlyphShape` を配置する。逆変換（ハンター文字 → かな）は `tokenToKana` / `tokensToKana` が担い、パレット入力の編集操作（濁点・半濁点・小書きの付け外し、1 字削除）は `src/lib/compose.ts` にある。この「純粋関数は `src/lib/`、React は描画と状態管理のみ」という分離が要点で、`src/lib/*.test.ts` がロジックを検証する。

**画像の書き出し**: `src/lib/export.ts` の `buildExportSvg` が、画面の SVG の中身に余白・背景・右下の透かしを足した SVG 文字列を組み立てる。PNG はこの同じ文字列を canvas でラスタライズして作るので、SVG と PNG の見た目は構造的に一致する。書き出し先では CSS 変数も webfont も解決できないため、色は直値、字体は総称ファミリで属性に持たせる。透かしが収まるよう横幅には下限があり、内容が狭いときは中央へ寄せる。純粋関数はここまでで、`ClipboardItem` と `navigator.share` の呼び出しは `src/lib/clipboard.ts` に分けてテストの対象外にする。Safari はユーザー操作と同じタスクでの `clipboard.write` しか許さないため、blob は await せず Promise のまま `ClipboardItem` へ渡す（この制約が `svgToPng` が Promise を返すだけで await しない理由）。

**グリフデータ**: `src/glyphs/glyphs.ts` が 1 文字 1 エントリ（`{ char, paths, dots? }`）。viewBox は `0 0 100 100`、`paths`（線）と `dots`（塗り円）に分かれ、`GlyphShape`（`src/components/GlyphShape.tsx`）が `currentColor` で描画する。基字は x=12〜78 / y=12〜84 の箱に収め、右下 x=78〜100 / y=74〜96 は濁点・半濁点のマーク領域として空けておく（新しい字を足すときの制約）。小書きは `translate(34 30) scale(0.62)` で右下寄せし、線幅は `STROKE_WIDTH / SMALL_SCALE` で縮小率を補正する。

**字形の正本**: 日本テレビ公式サイトの用語解説にあるハンター文字表（omniglot の対応表とも一致）。字形を変えるときはこれと突き合わせる。「、」「。」「×」は対応表に無い独自定義。

**濁点・半濁点の合成**: データは基字＋マーク（`dakutenGlyph` / `handakutenGlyph`）で持ち、`GlyphShape` が重ねて描画する（濁音ごとの独立グリフは持たない）。`DAKUTEN_TO_BASE` / `HANDAKUTEN_TO_BASE` / `SMALL_TO_BASE` の分解表を `kana.ts` に 1 本だけ持ち、`BASE_TO_*` はこれを `invert()` で反転して生成するので、往復変換が構造的に一致する。

**ルーティング**: hash ルート（`#/to-hunter` `#/to-kana` `#/chart`）を `useHashRoute`（`useSyncExternalStore` で `hashchange` を購読）で扱う。GitHub Pages のリロード 404 を避けるため BrowserRouter は使わない。共有リンクは同じ hash に本文を載せた `#/to-hunter?t=<本文>` で、解釈は `src/lib/share.ts` の `parseHash` に集約する（クエリ付きでも画面を取り違えないため）。本文の hash は入力のたびには書かず、`リンク` を押したときだけ組み立てる。

**デプロイ**: `vite.config.ts` の `base: '/hunter-moji/'` は Pages のパス。`.github/workflows/deploy.yml` が `main` への push で lint → test → build → Pages デプロイの順に実行する。`main` はブランチ保護（PR 必須・linear history 必須・force push 禁止）。

**テストの重心**: 変換ロジック（`src/lib/*.test.ts`）と字形の不変条件（`src/glyphs/glyphs.test.ts` の「対応表の全文字に字形がある」「字形が互いに異なる」「座標が viewBox 内」）。UI（`src/components/`）にはテストが無い。`vitest` の environment は `node` なので、`src/lib/` のモジュールは import しただけで DOM に触れてはいけない（`document` や `XMLSerializer` の参照は関数の中に置く）。

## 規約

- Biome 管理（タブインデント・ダブルクォート・lineWidth 既定の 80）。`corepack pnpm format` で整形する。
- 説明コメントは日本語で `ja:` プレフィックス。新規ファイルは末尾改行を付ける。
- `main` に直接コミットしない。作業はブランチ + PR + squash merge。コミットは Conventional Commits で、scope はブランチ slug（例: `feat(converter-app): ...`）。
