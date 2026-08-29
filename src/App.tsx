import { ChartView } from "./components/ChartView";
import { HunterToKanaView } from "./components/HunterToKanaView";
import { KanaToHunterView } from "./components/KanaToHunterView";
import { TABS, useHashRoute } from "./hooks/useHashRoute";

export default function App() {
	const [tab, setTab] = useHashRoute();

	return (
		<div className="app">
			<header className="app__header">
				<h1 className="app__title">ハンター文字コンバーター</h1>
				<p className="app__lead">ひらがなとハンター文字を相互に変換します。</p>
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
				<p>字形は原作を参照していない独自の近似デザインです。</p>
			</footer>
		</div>
	);
}
