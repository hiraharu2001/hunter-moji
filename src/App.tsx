import { ChartView } from "./components/ChartView";
import { HunterToKanaView } from "./components/HunterToKanaView";
import { KanaToHunterView } from "./components/KanaToHunterView";
import { TABS, useHashRoute } from "./hooks/useHashRoute";

export default function App() {
	const [tab, setTab] = useHashRoute();

	return (
		<div className="app">
			<header className="app__header">
				<div>
					<h1 className="app__title">ハンター文字コンバーター</h1>
					<p className="app__lead">
						かな（ひらがな・カタカナ）とハンター文字を相互に変換します。
					</p>
				</div>
				<a
					className="app__github"
					href="https://github.com/hiraharu2001/hunter-moji"
					target="_blank"
					rel="noreferrer"
					aria-label="GitHub リポジトリを開く"
				>
					<svg
						viewBox="0 0 16 16"
						width={16}
						height={16}
						fill="currentColor"
						role="img"
					>
						<title>GitHub</title>
						<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
					</svg>
					GitHub
				</a>
			</header>
			<nav className="tabs" aria-label="画面の切り替え">
				{TABS.map((item) => (
					<button
						className={
							item.id === tab
								? "tabs__button tabs__button--active"
								: "tabs__button"
						}
						type="button"
						key={item.id}
						aria-current={item.id === tab ? "page" : undefined}
						onClick={() => setTab(item.id)}
					>
						{item.label}
					</button>
				))}
			</nav>
			<main>
				{tab === "to-hunter" && <KanaToHunterView />}
				{tab === "to-kana" && <HunterToKanaView />}
				{tab === "chart" && <ChartView />}
			</main>
			<footer className="app__footer">
				<p>
					字形は日本テレビ公式サイトの用語解説にあるハンター文字表（omniglot
					の対応表とも一致）を正本として作画しています。「、」「。」「×」は対応表に無いため独自定義です。
				</p>
			</footer>
		</div>
	);
}
